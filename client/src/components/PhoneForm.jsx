import React, { useState, useId } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { countryCodes } from '../config';
import { addNewPhone, setCountry } from '../store/phoneSlice';

function PhoneForm() {
  const dispatch = useDispatch();
  const status = useSelector(state => state.phoneBook.status);
  const selectedCountry = useSelector(state => state.phoneBook.selectedCountry);
  
  const [number, setNumber] = useState('');
  const [error, setError] = useState('');
  
  // Генерируем уникальные ID для полей формы
  const countrySelectId = useId();
  const phoneInputId = useId();

  const validatePhone = (num) => {
    // Основная проверка - длина номера
    if (num.length < 3) return 'Номер должен содержать минимум 3 цифры';
    if (num.length > 10) return 'Номер должен содержать максимум 10 цифр';
    
    // Дополнительная проверка (на случай обхода ограничений)
    if (!/^\d+$/.test(num)) {
      return 'Номер должен содержать только цифры';
    }
    
    return '';
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!number.trim()) {
      setError('Введите номер телефона');
      return;
    }
    
    const validationError = validatePhone(number);
    if (validationError) {
      setError(validationError);
      return;
    }

    dispatch(addNewPhone({ 
      countryCode: selectedCountry, 
      number 
    }))
    .unwrap()
    .then(() => {
      setNumber('');
      setError('');
    })
    .catch(error => {
      setError(typeof error === 'string' ? error : error.message || 'Неизвестная ошибка');
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor={countrySelectId}>
          Код страны
        </label>
        <select
          id={countrySelectId}
          name="countryCode"
          value={selectedCountry}
          onChange={(e) => dispatch(setCountry(e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {countryCodes.map((country) => (
            <option key={country.code} value={country.code}>
              {country.name} ({country.code})
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label htmlFor={phoneInputId}>
          Номер телефона
        </label>
        <input
          id={phoneInputId}
          name="phoneNumber"
          type="text"
          value={number}
          onChange={(e) => {
            // Очищаем ввод от любых нецифровых символов
            const val = e.target.value.replace(/\D/g, '');
            setNumber(val);
            
            // Валидация только если есть ввод
            if (val) {
              setError(validatePhone(val));
            } else {
              setError('');
            }
          }}
          placeholder="Вводите только цифры"
          maxLength={10}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <p className="text-sm text-gray-500 mt-1">
          Введите от 3 до 10 цифр
        </p>
      </div>

      {error && (
        <div className="error-message bg-red-50 border border-red-200 text-red-700 p-3 rounded-md mb-4">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={status === 'loading' || !!error || !number}
        className={`w-full py-2 px-4 rounded-md text-white font-medium transition-colors ${
          status === 'loading' || !!error || !number
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700'
        }`}
      >
        {status === 'loading' ? 'Добавление...' : 'Добавить'}
      </button>
    </form>
  );
}

export default PhoneForm;