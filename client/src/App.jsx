import PhoneForm from './components/PhoneForm';
import PhoneList from './components/PhoneList';

function App() {
  return (
    <div className="container">
      <header className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          📱 Ввод телефонных номеров
        </h1>
        <p className="text-gray-600">
          Добавляйте и управляйте номерами телефонов
        </p>
      </header>
      
      <div className="card">
        <PhoneForm />
      </div>
      
      <div className="card">
        <PhoneList />
      </div>
      
      <footer className="mt-8 text-center text-gray-500 text-sm">
        © {new Date().getFullYear()} Телефонная книга
      </footer>
    </div>
  );
}

export default App;