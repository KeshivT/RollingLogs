# Rolling Logs
## About
Rolling logs is a game in which the player has to dodge logs rolling towards them by strafing left and right or jumping.

It involves collision detection, object rendering, and computer graphics.

This is a Winter 2025 CS174A project by Keshiv Tandon ([KeshivT](https://github.com/KeshivT)), Shuma (), and Philemon ().

## Features
**Theme**
The main focus of the game will be trying to dodge objects, in the case of this game, we are going to use logs that are rolling towards you to see how long you can survive. 
To survive you the character will be able to move right to left and also be able to jump to dodge the logs approaching you. 
This game was inspired by Cubefield, but putting our twist into the game. 


**Topics learned in this class**
Logs use translation, rotation, and scaling to move closer to the player, roll, and grow bigger as they get closer, respectively


**Interactivity** 
- Users can move their character right to left using their arrow keys pointing right to left
- Users can make their character jump by pressing the space bar 


**Advanced Features** 
- Collision detection
- Physics (gravity for jumping sprite)


**Implementation**
- Logs
- The logs will essentially be brown cylinders
- They will rotate constantly, translating towards the camera and scaling as needed to create a sense of perspective
- The length of each log will be randomly generated


**Character**
- The main character will be a green cube
- It can jump and strafe left and right, which is all translation
- It does not jump high so jump physics will be very basic


**Collision**
- If the character collides with any log, the game will end
- Use AABB collision detection - simple and cost-effective
- Other features
- Randomly generated logs?
- Speed up as game progresses?
