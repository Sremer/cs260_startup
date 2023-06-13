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
        <Route path='/' element= {
          <Login />
        }
        exact
      />
      </Routes>
    </BrowserRouter>
  );
}

function NotFound() {
  return <main className='container-fluid bg-secondary text-center'>404: Return to sender. Address unknown.</main>;
}

