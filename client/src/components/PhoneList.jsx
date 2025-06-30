import React, { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchPhones, 
  deletePhone,
  setWsStatus,
  wsAddPhone,
  wsDeletePhone,
} from '../store/phoneSlice';

const PhoneList = () => {
  const dispatch = useDispatch();
  const { 
    items: phones, 
    status, 
    error,
    wsConnected
  } = useSelector(state => state.phoneBook);
  
  const phonesRef = useRef(phones);
  phonesRef.current = phones;

  useEffect(() => {
    dispatch(fetchPhones());
    
    const ws = new WebSocket('ws://localhost:8080/ws');
    
    ws.onopen = () => {
      console.log('WebSocket подключен');
      dispatch(setWsStatus(true));
    };
    
    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        console.log('WebSocket message:', message);

        if (message.type === 'ADD_PHONE') {
          const phone = {
            ...message.phone,
            id: Number(message.phone.id)
          };
          
          const exists = phonesRef.current.some(p => 
            p.id === phone.id || 
            (p.country_code === phone.country_code && 
             p.number === phone.number)
          );
          
          if (!exists) {
            dispatch(wsAddPhone(phone));
          }
        }
        else if (message.type === 'DELETE_PHONE') {
          dispatch(wsDeletePhone(Number(message.id)));
        }
      } catch (error) {
        console.error('Ошибка обработки WebSocket:', error);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket ошибка:', error);
      dispatch(setWsStatus(false));
    };

    ws.onclose = () => {
      console.log('WebSocket закрыт');
      dispatch(setWsStatus(false));
    };

    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, [dispatch]);

  const handleDelete = (id) => {
    if (window.confirm('Удалить номер?')) {
      dispatch(deletePhone(id));
    }
  };

  if (status === 'loading' && phones.length === 0) {
    return <p className="text-gray-500 mt-4 text-center">Загрузка...</p>;
  }

  if (error) {
    return (
      <div className="bg-red-100 text-red-700 p-4 rounded-md my-4">
        Ошибка: {error}
      </div>
    );
  }

  if (phones.length === 0) {
    return <p className="text-gray-500 mt-4 text-center">Список номеров пуст</p>;
  }

  return (
    <div className="mt-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Добавленные номера</h2>
        <span className={`px-3 py-1 rounded-full text-xs ${
          wsConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {wsConnected ? 'Online' : 'Offline'}
        </span>
      </div>
      
      <div className="space-y-3">
        {phones.map(phone => (
          <div 
            key={phone.id}
            className="border border-gray-200 bg-white rounded-md p-4 flex justify-between items-center shadow-sm hover:shadow-md transition-shadow"
          >
            <div>
              <span className="font-semibold text-base">{phone.country_code}{phone.number}</span>
            </div>
            
            <button
              onClick={() => handleDelete(phone.id)}
              className="bg-gray-100 hover:bg-red-300 text-gray-700 px-3 py-1 rounded transition-colors border border-gray-300"
              disabled={status === 'loading'}
            >
              Удалить
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PhoneList;