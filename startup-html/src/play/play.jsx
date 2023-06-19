import React from 'react';

import { PlayState } from './playState';
import { InPlay } from './inPlay';
import { Finished } from './finished';
import { useNavigate } from 'react-router-dom';

import 'bootstrap/dist/css/bootstrap.min.css';
import './play.css';

export function Play() {
  const navigate = useNavigate();
  const [playState, setPlayState] = React.useState(PlayState.InPlay);

  const changeToFinished = () => {
    setPlayState(PlayState.Finished);
  }

  return (
    <>
      <div className="container">
          <header className="d-flex flex-wrap align-items-center justify-content-left justify-content-md-between py-1 mb-0 text-light">
              
            <ul className="nav col-8 col-md-auto mb-1 mb-md-0">
              <li><a onClick={() => navigate('/select')} className="nav-link px-2 link-dark">quit</a></li>
            </ul>
      
          </header>
      </div>

        { playState === PlayState.InPlay && <InPlay changeToFinished={changeToFinished} /> }
        { playState === PlayState.Finished && <Finished /> }
    </>
  );
}