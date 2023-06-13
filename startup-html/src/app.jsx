import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './app.css';
import { BrowserRouter, NavLink, Route, Routes } from 'react-router-dom';
import { Login } from './login/login';
import { Mode } from './mode/mode';
import { Play } from './play/play';
import { Scores } from './scores/scores';
import { Select } from './select/select';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={ <Login /> } />
        <Route path='/select' element={ <Select /> } />
        <Route path='/mode' element={ <Mode /> } />
        <Route path='/play' element={ <Play /> } />
        <Route path='/scores' element={ <Scores/> } />
        <Route path='*' element={ <NotFound /> } />
      </Routes>
    </BrowserRouter>
  );
}

function NotFound() {
  return <main className='container-fluid bg-secondary text-center'>404: Return to sender. Address unknown.</main>;
}

