class barra // Class for both sticks
{
    constructor(x, y, width, height, speed=1)
    {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.speed = speed;
    }

    moveUp()
    {
        this.y -= this.speed;
    }

    moveDown()
    {
        this.y += this.speed;
    }

    draw(context)
    {
        context.fillStyle = 'white';
        context.fillRect(this.x, this.y, this.width, this.height);
    }

    update(key, down) // Sticks can move up and down 
    {
        if((key == "ArrowDown" || key == "s") && this.y < (down - this.height))
            this.y += 5
        if((key == "ArrowUp" || key == "w") && this.y > 0)
            this.y -= 5
    }
}

class pelota // Ball class
{
    constructor(x, y, radio, speed=1)
    {
        this.x = x;
        this.y = y;
        this.radio = radio;
        this.speed = speed;

        this.up = true;
        this.right = true;

    }

    draw(context)
    {
        context.fillStyle = 'white';
        context.beginPath();
        context.arc(this.x, this.y, this.radio, 0, Math.PI * 2);
        context.closePath();
        context.fill();

    }

    update(up, down, left, right, stick1_x, stick1_y, stick2_x, stick2_y) // Animate the ball taking collisions into account
    {
        if(this.up)
            this.y -= this.speed;
        else
            this.y += this.speed;

        if(this.right)
            this.x += this.speed;
        else
            this.x -= this.speed;

        // Canvas collisions
        if((this.y - this.radio) <= up){     
            this.up = false;
        }
    
        if((this.y + this.radio) >= down){   
            this.up = true;
        }   

        if((this.x + this.radio) >= right){
            this.right = false;   
        }
            
        if((this.x - this.radio) <= left){
            this.right = true;
        }
        
        //COLLISIONS WITH STICKS

        //LEFT STICK
        //side collisions
        if((this.x == stick1_x + 20) && (this.y >= stick1_y && this.y <= (stick1_y + 60))){
            if(this.up === true){
                this.up = false;
                if (this.right === false){
                    this.right = true;
                }
            } else if(this.up === false){
                this.up = true;
                if (this.right === false){
                    this.right = true;
                }
            }
        } else if ((this.x == stick1_x) && (this.y >= stick1_y && this.y <= (stick1_y + 60))){
            if(this.up === true){
                this.up = false;
                if(this.right === true){
                    this.right = false;
                } 
            }  else if(this.up === false){
                this.up = true;
                 if(this.right === true){
                    this.right = false;
                } 
            }  
        // Top and bottom collisions 
        } else if((this.y == stick1_y) && (this.x >= stick1_x && this.x <= (stick1_x + 20))){
            if(this.up === true){
                console.log("TOP, LEFT STICK");
                this.up = false;
                if (this.right === false){
                    this.right = true;
                }
            } else if(this.up === false){
                this.up = true;
                if (this.right === false){
                    this.right = true;
                }
            }
        } else if ((this.y == stick1_y - 60) && (this.x >= stick1_x && this.x <= (stick1_x + 20))){
            if(this.up === true){
                console.log("BOTTOM, LEFT STICK");
                this.up = false;
                if(this.right === true){
                    this.right = false;
                } 
            }  else if(this.up === false){
                this.up = true;
                 if(this.right === true){
                    this.right = false;
                } 
            }
        }
        // RIGHT STICK
        //Sides collisions
        else if ((this.x == stick2_x) && (this.y >= stick2_y && this.y <= (stick2_y + 60))){
            if(this.up === true){
                this.up = false;
                if(this.right === true){
                    this.right = false;
                }
            } else if(this.up === false){
                this.up = true;
                if(this.right === true){
                    this.right = false;
                }
            }
        } else if ((this.x == (stick2_x + 20)) && (this.y >= stick2_y && this.y <= (stick2_y + 60))){
            if(this.up === true){
                this.up = false;
                if (this.right === false){
                    this.right = true;
                }
            } else if(this.up === false){
                this.up = true;
                if (this.right === false){
                    this.right = true;
                }
            }
            //Top and bottom collisions
        } else if((this.y == stick2_y) && (this.x >= stick2_x && this.x <= (stick2_x + 20))){
            console.log("TOP");
            if(this.up === true){
                this.up = false;
                if (this.right === false){
                    this.right = true;
                }
            } else if(this.up === false){
                this.up = true;
                if (this.right === false){
                    this.right = true;
                }
            }
        } else if ((this.y == stick2_y - 60) && (this.x >= stick2_x && this.x <= (stick2_x + 20))){
            console.log("BOTTOM");
            if(this.up === true){
                this.up = false;
                if(this.right === true){
                    this.right = false;
                } 
            }  else if(this.up === false){
                this.up = true;
                 if(this.right === true){
                    this.right = false;
                } 
            }
        }    
    }
}

function updateBall(canvas, context, barras, bola) //Draw animations and movements of ball
{
    requestAnimationFrame(()=>updateBall(canvas, context, barras, bola));

    context.clearRect(0,0, canvas.width, canvas.height);
    
    barras.forEach(barra => {
        barra.draw(context);
    })
    bola.draw(context);
    bola.update();

    bola.update(0, canvas.height, 0, canvas.width, barras[0].x, barras[0].y, 
                barras[1].x, barras[1].y);
}

function updateSticks(key, canvas, context, barra){ //Animate left and right sticks

    context.clearRect(0,0, canvas.width, canvas.height);

    // barras.forEach(barra => {
        barra.draw(context);
        barra.update(key, canvas.height);

    // }) 

}

function main()
{
    const canvas = document.getElementById("pongCanvas");
    const context = canvas.getContext("2d");

    let barraIzq = new barra(10, 120, 20, 60);
    let barraDer = new barra(570, 120, 20, 60);
    let bola = new pelota(canvas.width/2, canvas.height/2, 10);

    let barras = [];

    barras.push(barraIzq, barraDer);

    barras.forEach(barra => { //Draw first sticks
        barra.draw(context);
    })

    updateBall(canvas, context, barras, bola); // Animates the ball

    document.addEventListener('keydown', (e) => { //Move sticks with up and down arrows
        const key = e.key;
        if(key == "ArrowDown" || key == "ArrowUp"){ // Move Left stick
            updateSticks(key, canvas, context, barras[0]);
        } else if (key == "w" || key == "s") { // Move Right stick
            updateSticks(key, canvas, context, barras[1]);
        }
    });

}