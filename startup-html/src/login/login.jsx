import React from 'react';
import { useNavigate } from 'react-router-dom';

import './login.css'

export function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [exitState, setExitState] = React.useState(false);

  async function login() {
    loginOrSignUp(`/api/auth/login`);
  }

  async function signUp() {
      loginOrSignUp(`/api/auth/signUp`);
  }

  async function loginOrSignUp(endpoint) {
    if (!!username && !!password) {
        const response = await fetch(endpoint, {
            method: 'post',
            body: JSON.stringify({ username: username, password: password }),
            headers: {
            'Content-type': 'application/json; charset=UTF-8',
            },
        });

        if (response.ok) {
            localStorage.setItem('username', username);
            
            setExitState(true);

            setTimeout(()=>{
                navigate('/select');
            }, 1200);

        } else {
            const body = await response.json();
            alert(body.msg);
        }
    } else {
        alert('Please fill out the fields');
    }
}

  return (
    <main>
      <main>
            <div className={`h1-container ${exitState ? 'exitTitle' : '' }`}>
                <h1>ditty</h1>
            </div>

            <section id="inputSection" className={`${exitState ? 'exitFields' : '' }`}>
                <div>
                  <input 
                    id="username" 
                    type="text" 
                    className="normal dark" 
                    onChange={(e) => setUsername(e.target.value)} 
                    placeholder="username" />
                </div>

                <div>
                  <input 
                    id="password" 
                    type="password" 
                    className="normal dark"
                    onChange={(e) => setPassword(e.target.value)} 
                    placeholder="password"/>
                </div>

                <div id="btns"><button className="normal dark" onClick={() => login()}>login</button> 
                <button id="signup" className="normal dark" onClick={() => signUp()}>sign-up</button></div>
            </section>
        </main>
    </main>
  );
}