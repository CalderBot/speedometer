// Gauge that displays current, max, and average values on an analogue style display.   
// Typical usage is that the gauge is a speedometer.
// Note: REQUIRES Raphael.js


// Gauge consructor.  divNameStr is the name of the div to contian the gauge.  units (e.g. "mph") is the name of the  tracked quantity.  w and h are the dimensions of the gauge. min/maxValue describe the range of values to display.  current/max/ave are the current/max/average of the value.    
var Gauge = function(divNameStr,units,w,h,minValue,maxValue,current,max,ave){
    // --- USER ADJUSTABLE PARAMETERS --------- 
    var ANIMATION_TIME=2000;       // How quickly the dial turns when speed changes
    var EASING_STYLE="backOut"     // Easing style for the dial's animation
    var TICKLENGTH=10;             // Pixel length of tickmarks 
    var TICKCOLOR = "blue";        // Color of tickmarks
    var CURRENT_HAND_COLOR = "red";// Color of hand that points at current value
    var AVE_HAND_COLOR = "yellow"; // Color of hand that points at average value
    var MAX_HAND_COLOR = "green";  // Color of hand that points at maximum value
    var VALUE_COLOR = "yellow"; // Color of the text that displays numeric values
    var TEXTHEIGHT = Math.min(0.03*w,0.03*h);           // How big the numbers are written
    var ANGLE = 60;                // Starting angle, where minValue is displayed.
    
    // -- Other internal parameters ---
    var R = Math.min(w/2,h/2);     // Main gauge radius
    var CR = 0.25*R;               // Center circle radius
    var centerTextSize = 0.2*R;
    var maxPath, avePath, currentPath; //  The hands which display current, max, ave
    var radians = (360-2*ANGLE)/(maxValue-minValue) // number of radians on gauge per unit of Value
    var cx = w/2;                  // The center of the dial, relative to left side of its container
    var cy = h/2;                  // The height of the dial, relative to top of its container
    
    // -- Acceccible properties ---
    // this.startTime = Date.now();
    // this.currentTime = this.startTime;

    
    this.current=current || 0;
    this.previous = this.current;
    this.max = max || this.current;
    this.ave = ave || this.current;
    this.r = Raphael(divNameStr, w, h);  // this creates the Raphael.js 'paper' object
  //  var s = this.r.set();
    // Add a center circle and center text
    this.r.circle(cx,cy, CR).attr({fill: "none", "stroke-width": 2, stroke:"red"});
    this.centerText = this.r.text(cx, cy,this.current).attr({'font-size':centerTextSize, fill: VALUE_COLOR})
    this.r.text(cx, cy+0.7*centerTextSize,units).attr({'font-size':centerTextSize/2, fill: VALUE_COLOR})

    // Add the gauge to the paper and make the numeric values clickable: 
    // Note: Clickability is basically a dev tool, useful for tuning animation paramters.
    var angle = ANGLE;
    while (angle <= 360-ANGLE) {
        (function (t,ang,self) {
            // Add short tick marks:
            if(angle%30 !== 0){
                self.r.path("M"+cx+","+(cy+R-2*TICKLENGTH-TEXTHEIGHT)+"l0,"+TICKLENGTH).attr({ stroke: TICKCOLOR, "stroke-width":"1.5", transform: t})
            }
            // Every fifth tickmark is longer, and displays a clickable value:
            else{ 
                self.r.path("M"+cx+","+(cy+R-3*TICKLENGTH-1.5*TEXTHEIGHT)+"l0,"+(1.5*TICKLENGTH)).attr({ stroke: TICKCOLOR, "stroke-width":"2", transform: t})

                self.r.text(cx, cy+R-TEXTHEIGHT,(angle-ANGLE)/radians).attr({'font-size':TEXTHEIGHT, fill: VALUE_COLOR, transform: t+"r180"})
                .click(function(e){ 
                    // Note: It's important to rotate by -ANGLE before .split, since split.rotate returns a value %360. 
                    self.current = Math.round((Raphael.toMatrix(e,t+"r"+(-ANGLE)).split().rotate)/radians);
                    self.update(self.current);
                })
            }
        })("r"+angle+","+cx+","+cy,-angle,this);
        angle += 6;
    }

    // Create a the current, max, and ave display hands        
    maxPath = this.r.path("M"+cx+","+(cy+CR)+"l0,"+(R-CR-TICKLENGTH-1.5*TEXTHEIGHT)).attr({fill: "none", "stroke-width": 3, stroke:MAX_HAND_COLOR, transform: "r"+(ANGLE+radians*this.max)+","+cx+","+cy})
    avePath = this.r.path("M"+cx+","+(cy+CR)+"l0,"+(R-CR-TICKLENGTH-1.5*TEXTHEIGHT)).attr({fill: "none", "stroke-width": 3, stroke:AVE_HAND_COLOR, transform: "r"+(ANGLE+radians*this.ave)+","+cx+","+cy})
    currentPath = this.r.path("M"+cx+","+(cy+CR)+"l0,"+(R-CR-TICKLENGTH-1.5*TEXTHEIGHT)).attr({fill: "none", "stroke-width": 4, stroke:CURRENT_HAND_COLOR, transform: "r"+(ANGLE+radians*this.current)+","+cx+","+cy});

    // animate the motion of hands to newly updated values
    this.animateHands = function(){
        maxPath.animate( { transform: "r"+(ANGLE+radians*this.max)+","+cx+","+cy }, ANIMATION_TIME, EASING_STYLE); 
        avePath.animate( { transform: "r"+(ANGLE+radians*this.ave)+","+cx+","+cy }, 1000, "linear"); 
        currentPath.animate({transform: "r"+(ANGLE+radians*this.current)+","+cx+","+cy}, ANIMATION_TIME, EASING_STYLE);
    }

    // Update gauge when new current value is input:
    this.update = function(cur){
        // Mark the time
        var now = Date.now();

        // update the values:
        if(cur !== undefined){
            this.current = cur;
            this.max = Math.max(this.max,this.current);
        }
        // This only happens on the first update
        if(this.startTime === undefined){  
            this.startTime = now;
            this.ave = this.current; 
        }
        // Given average values a1, a2 over durations t1,t2, their combined average is (a1*t1+a2*t2)/(t1+t2).  Note that we can only update with the previous speed, because that's the one we know how long it has been at. whereas this.current is what is has just this instant become.
        else{ this.ave = (this.ave*(this.currentTime-this.startTime)+this.previous*(now-this.currentTime))/(now-this.startTime); }
        
        this.currentTime = now;
        this.previous = this.current;

        // Display current value on center:
        if(cur !== undefined && this.centerText) this.centerText.remove();
        if(cur !== undefined) this.centerText = this.r.text(cx, cy,this.current).attr({'font-size':centerTextSize, fill: VALUE_COLOR})

        // Animate transitions to new values:
        this.animateHands();

    } 

    this.reset = function(){
        this.currentTime = Date.now();
        this.startTime = this.currentTime;
        this.max = 0;
        this.ave = 0;
        this.current = 0;
        this.previous = 0;
        // Display current value on center:
        if(this.centerText) this.centerText.remove();
        this.centerText = this.r.text(cx, cy,this.current).attr({'font-size':centerTextSize, fill: VALUE_COLOR})
        this.animateHands();
    }   
}




