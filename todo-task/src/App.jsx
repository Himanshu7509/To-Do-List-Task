import React from 'react'
import WelcomePage from './components/welcome/WelcomePage'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import HomePage from './components/home/HomePage'
import UpcomingTasks from './components/Upcomming/UpComming'
import NotFound from './components/notFound/notFound'
import FilterAndLabel from './Filterandlabel/FilterAndLabel'
import Completed from './components/completed/Completed'
import Label from './components/completed/label/Label'

const App = () => {
  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<WelcomePage />} />
          <Route path='/home' element={<HomePage />} />
          <Route path="/upcoming" element={<UpcomingTasks />} />
          <Route path='/completed' element={<Completed/>} />
          <Route path="/filter" element={<FilterAndLabel />} />
          <Route path="*" element={<Label/>} />
          <Route path='/*' element={<NotFound/>}/>
        </Routes>
      </BrowserRouter>
    </div>
  )
}

export default App