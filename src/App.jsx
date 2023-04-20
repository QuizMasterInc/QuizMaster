import './App.css'
import NavBar from './components/navbar/NavBar'
import { Route, Routes } from "react-router-dom";
import NotFound from './components/404/NotFound';
import SelectQuiz from './components/quizselect/SelectQuiz';
import QuizActivity from './components/quiz/QuizActivity';
import Login from './components/login/Login';
import Register from './components/login/Register';
import Home from './components/home/Home';
import About from './components/about/About';
import Contact from './components/contact/Contact';
import { AuthProvider } from './contexts/AuthContext';
import Dashboard from './components/dashboard/Dashboard'
import ForgotPassword from './components/login/ForgotPassword'
import UpdateProfile from './components/login/UpdateProfile'
import PrivateRoute from './routes/PrivateRoute';
import PrivateSigninRoute from './routes/PrivateSigninRoute'
import { CategoryProvider, useCategory } from './contexts/CategoryContext';

function App() {
  const {destinations} = useCategory();
  
  return (
    <div className="App">
      <AuthProvider>
          <Routes>
            <Route path="/" element={<Home />}/>
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/quizzes">
              <Route index element={
                <PrivateRoute>
                  <CategoryProvider>
                    <SelectQuiz />
                  </CategoryProvider>
                </PrivateRoute>
              }/>
              
              {destinations.map((destination, index) => {
                {console.log(destination)}
                return ( //this return here is extremely important. do not delete it unless you want to go through the same pain i did :)
                <Route key={index} path={destination} element={
                  <PrivateRoute>
                    <QuizActivity />
                  </PrivateRoute>
                }/>)
              })}
            </Route>
            <Route path="/updateprofile" element={
              <PrivateRoute>
                <UpdateProfile />
              </PrivateRoute>
            }/>
            <Route path='/signin' element={
              <PrivateSigninRoute>
                <Login />
              </PrivateSigninRoute>
            }/>
            <Route path="/forgotpassword" element={
              <PrivateSigninRoute>
                <ForgotPassword />
              </PrivateSigninRoute>
            }/>
            <Route path='/register' element={
              <PrivateSigninRoute>
                <Register />
              </PrivateSigninRoute>
            }/>
            <Route path='/dashboard' element={
              <PrivateRoute>
                <CategoryProvider>
                  <Dashboard />
                </CategoryProvider>
              </PrivateRoute>
            }/>
            <Route path="*" element={<NotFound />} />
          </Routes>
          <NavBar/>
      </AuthProvider>
    </div>
  )
}
export default App