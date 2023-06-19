import React from 'react';

import { useNavigate } from 'react-router-dom';
import { gameData } from '../gameData/gameData';

export function Finished() {
    const navigate = useNavigate();

    return (
        <div id="finishMode">
            <div id="scoreCard" className="card cardEnter">
                <div className="container1">
                    <div className="finalSpacing" id="finalUsername"> {gameData.playerName} </div>
                    <div className="finalSpacing" id="finalTime"> {localStorage.getItem('time')} </div>
                    <div className={`finalSpacing ${gameData.withFriend ? '' : 'hide'}`} id="finalFriendUsername"> {gameData.friendName} </div>
                    <div className={`finalSpacing ${gameData.withFriend ? '' : 'hide'}`} id="finalFriendTime"> {localStorage.getItem('friendTime')} </div>
                    <div className="finalSpacing" id="comment">nice work!</div>
                    <div><button className="normal dark" onClick={() => navigate('/select')}>finish</button></div>
                </div>
            </div>
        </div>
    );
}