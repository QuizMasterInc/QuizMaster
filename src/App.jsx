/**
 * This is the main App component.
 * This is how our application is run.
 * Some routes are private routes. meaning the user has to be signed in
 * Notice that some components are enclosed in the contexts, this is how we share state between these components. 
 * The routes are enclosed in the authprovider, this is how we ensure authenticaiton throughout the application
 */
import './App.css'
import NavBar from './components/navbar/NavBar'
import NavBarUser from './components/navbar/NavBarUser'
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
import DeveloperRoute from './routes/DeveloperRoute';
import { CategoryProvider, useCategory } from './contexts/CategoryContext';
import CustomQuiz from './components/customquiz/CustomQuiz';
import EditCustomQuiz from "./components/customquiz/EditCustomQuiz"
import SelectSubCategory from './components/quizselect/SelectSubCategory';
import TypeOfQuiz from './components/typeofquiz/TypeOfQuiz';
import Developer from './components/developer/AddDefaultQuestion';
import AllCustomQuizzes from './components/quizselect/AllCustomQuizzes';
import CustomQuizActivity from './components/quiz/CustomQuizActivity'


function App() {
  //importing destinations here from the context. 
  const {destinations} = useCategory();
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';

  return (
    <div className="App">
      <AuthProvider>
          <Routes>
            {isAuthenticated ? (
              <Route path="/" element={
                <PrivateRoute>
                  <CategoryProvider>
                    <Dashboard />
                  </CategoryProvider>
                </PrivateRoute>
              } />
            ) : (
              <Route path="/" element={<Home />} />
            )
            }
            
            <Route path="/developer" element={
              <DeveloperRoute>
                <Developer />
              </DeveloperRoute>
            }/>
            <Route path="/home" element={<Home />}/>
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
                //rendering the routes based on the categories we have.
                return ( //this return here is extremely important. do not delete it unless you want to go through the same pain i did :)
                <Route key={index} path={destination} element={
                  <PrivateRoute>
                    <CategoryProvider>
                      <SelectSubCategory />
                    </CategoryProvider>
                  </PrivateRoute>
                } caseSensitive/>)
              })}
              <Route path="quizstarted" element={
                <PrivateRoute>
                  <CategoryProvider>
                    <QuizActivity />
                  </CategoryProvider>
                </PrivateRoute>
              }/>
            </Route>
            <Route index path="/quizstarted/:quizID" element={
              <PrivateRoute>
                <CustomQuizActivity/>
              </PrivateRoute>
            }/>
            <Route path="/customquiz" element={
              <PrivateRoute>
                <CustomQuiz />
              </PrivateRoute>
            }/>
            <Route index path="/customquiz/:quizID" element={
              <PrivateRoute>
                <EditCustomQuiz />
              </PrivateRoute>
            }/>
            <Route path="/typeofquiz" element={
              <PrivateRoute>
                <TypeOfQuiz />
              </PrivateRoute>
            }/>
            <Route path="/allcustomquizzes" element={
              <PrivateRoute>
                <AllCustomQuizzes />
              </PrivateRoute>
            }/>
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
          <NavBarUser/>
      </AuthProvider>
    </div>
  )
}
export default App