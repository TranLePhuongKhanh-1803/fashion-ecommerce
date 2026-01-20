/**
 * Main App Component
 */
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import ErrorBoundary from './components/ErrorBoundary';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Login from './pages/Login';
import Register from './pages/Register';

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <CartProvider>
          <Router>
            <div className="flex flex-col min-h-screen">
              <ErrorBoundary>
                <Header />
              </ErrorBoundary>
              <main className="flex-grow">
                <ErrorBoundary>
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/shop" element={<Shop />} />
                    <Route path="/product/:id" element={<ProductDetail />} />
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/about" element={
                      <div className="container mx-auto px-4 py-16 text-center">
                        <h1 className="text-4xl font-bold mb-4">About Us</h1>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                          Welcome to Fashion Store! We are dedicated to providing you with the latest fashion trends
                          and high-quality clothing for every occasion. Our mission is to make fashion accessible to everyone.
                        </p>
                      </div>
                    } />
                  </Routes>
                </ErrorBoundary>
              </main>
              <ErrorBoundary>
                <Footer />
              </ErrorBoundary>
            </div>
          </Router>
        </CartProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
