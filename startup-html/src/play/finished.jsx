import React from 'react';

export function Finished() {
    return (
        <div id="finishMode">
            <div id="scoreCard" class="card cardEnter">
                <div class="container1">
                    <div class="finalSpacing" id="finalUsername">username</div>
                    <div class="finalSpacing" id="finalTime">00:00</div>
                    <div class="finalSpacing" id="finalFriendUsername">friend</div>
                    <div class="finalSpacing" id="finalFriendTime">00:00</div>
                    <div class="finalSpacing" id="comment">nice work!</div>
                    <div><button class="classic" onclick="finish()">finish</button></div>
                </div>
            </div>
        </div>
    );
}