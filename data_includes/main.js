// Maze script
// Version: 2022-10-04
// https://www.pcibex.net/documentation/

PennController.ResetPrefix(null); // Shorten command names (keep this line here)
PennController.DebugOff();

// ## Prelims
// A: Make sure the counter is reset at every new participant for more equal distribution,
//    This needs to be run in the sequence below
SetCounter("inc", 1);

// B: Define sequence of the individual blocks:
//    * Begin with the reset counter
//    * Then play intro and instructions
//    * Training phase
//    * Intermission after training
//    * MAIN: randomizes the stentences, break after N sentences
//    * Debrief, send results, and a goodbye message with verification link (if applicable)
Sequence("counter",
    "intro",
    "instructions",
    "training",
    "intermission",
    sepWithN( "break" , randomize("experiment") , 1),
    "debrief", SendResults(), "goodbye")

// C: Define a header that happens at the beginning of every single trial
Header(
    // We will use this global Var element later to store the participant's name
    newVar("ParticipantName")
        .global()
    ,
    // Delay of 750ms before every trial
    newTimer(750)
        .start()
        .wait()
)

// D: Log participant information
//    * Grabs the prolific participant ID from the URL parameter
//      (set this in Prolific!)
//    * The log command adds a column with participantID to every line in results
.log("ParticipantID", PennController.GetURLParameter("participant") );
// .log( "Name" , getVar("ParticipantName") ) // if not via prolific

// ## Experiment Section
// # Introduction

// A: Introduction
newTrial("intro",

    newText("<p>Welcome!</p>")
        .css("font-size", "1.2em")
        .css("font-family", "Verdana")
        .print()
    ,
    newText("<p><strong>Informed Consent</strong>:</p>")
        .css("font-family", "Verdana")
        .print()
    ,
    newText("<p><strong>Voluntary participation:</strong> I understand that my participation in this study is voluntary.<br/>" +
        "<strong>Withdrawal:</strong> I can withdraw my participation at any time during the experiment.<br/>"+
        "<strong>Risks:</strong> There are no risks involved.<br/>"+
        "<strong>Equipment:</strong> I am participating from a device with a <strong>physical keyboard</strong>.<br/>"+
        "<strong>Environment:</strong> I participate from a quiet environment and can <strong>work uninterrupted</strong>.</p>")
        .css("font-family", "Verdana")
        .print()
    ,
    newText("<p>By hitting SPACE I consent to the above.")
        .css("font-family", "Verdana")
        .print()
    ,
    newKey(" ")
        .log()
        .once()
        .wait()
)

// B: Instructions

newTrial("instructions" ,

    newText("<p><strong>The maze-experiment</strong></p>")
        .css("font-size", "1.2em")
        .css("font-family", "Verdana")
        .print()
    ,
    newText("<p>Your task is to read sentences as fast as possible: You are given two words at<br>"+
        "a time, which appear side by side – but only <strong>one</strong> of them is a possible continuation<br> "+
        "of the sentence. In other words, you need to find a way through a maze:</p>")
        .css("font-size", "1em")
        .css("font-family", "Verdana")
        .print()
    ,
    newImage("maze", "gmaze.png")
        .size(200,)
        .center()
        .print()
    ,
    newText("<p>Use the <strong>F</strong> and <strong>J</strong> keys to select the word that continues the sentence.<br> " +
        "If you pick the wrong word, you'll see an error, but can try again to continue reading.</p>" +
        "<p><strong>Please try to be quick <em>and</em> accurate.</strong></p>" +
        "<p>Errors are okay, sometimes even expected. Just try to avoid too many errors<br> " +
        "and pay close attention to what you are reading.</p>"+
        "<p>We’ll start with up to 5 practice sentences. Training ends early when you have<br> " +
        "successfully mazed through 3 sentences (it will then take a few seconds to jump<br> "+
        "the rest and load the main experiment).</p>")
        .css("font-size", "1em")
        .css("font-family", "Verdana")
        .print()
    ,
    newText("Press SPACE to continue to the training sentences.")
        .css("font-family", "Verdana")
        .print()
    ,
    newKey(" ")
        .log()
        .once()
        .wait()
) // instructions

Template("own_amaze.csv", row =>
    newTrial("training",

        newVar("training_successes", 0)
            .global()
            .test.is(v => v > 1)
            .success(end())
        ,

        newController("Maze", {s: row.Sentence, a: row.Distractor})
            .css("font-size", "1em")
            .css("font-family", "Verdana")
            .print()
            .log()
            .wait()
            .remove()
            .test.passed()
            .failure(newText("<br/>oops!").css("font-size", "1em").css("color", "red").print())
            //.success(newText("<br/>great!").css("font-size", "1.5em").css("color", "green").print())
            .success(getVar("training_successes").set(v => v + 1), newText("<br/>great!").css("font-size", "1.5em").css("color", "green").print())

        ,
        newTimer(500).start().wait()
    )
        // logs additional variables in sentence file (e.g., Fun)
        .log("ExpId", row.ExpId) // the experiment ID
        .log("Id", row.Id) // the sentence ID (unique for each experiment)
        .log("Group", row.Group)

    ,

) // defines template for the main experiment

newTrial("intermission" ,

    newText("<p>Alright, you should be good to go for the 32 experimental sentences!<br/>" +
        "Remember: try to be <strong>quick and accurate</strong>.</p>" +
        "<p>Some sentences will be quite complex, some will be simpler.</p>" +
        "<p>The task is fun, but also demanding, so there are designated<br/>" +
        "breaks every 8 sentences at which points you can pause if you want.<br/></p>" +
        "<p>Please <strong>do not</strong> take a break <em>while</em> reading a sentence.</p>")
        .css("font-family", "Verdana")
        .print()
    ,
    newText("<p>Press SPACE when you are ready to begin the main experiment.</p>")
        .css("font-family", "Verdana")
        .print()
    ,
    newKey(" ")
        .log()
        .once()
        .wait()
) // instructions

// DEFINE MAIN EXPERIMENT TEMPLATE
Template("stims.csv", row =>
    newTrial("experiment",

        // add, temporarily, an ID to check where alternatives are ambiguous
        newText("ExpId", row.Type)
            .css("font-family", "Verdana")
            .center()
            .print()
        ,
        newController("P", "Maze", {s: row.PrimeSent, a: row.PrimeDist})
            .css("font-size", "1em")
            .css("font-family", "Verdana")
            .print()
            .log()
            .wait()
            .remove()
            .test.passed()
            .success(
            ...(row.Filler == "y" ? [
                newTimer("beforeFiller", 500)
                    .start()
                    .wait()
                ,
                newController("F", "Maze", {s: row.FillerSent, a: row.FillerDist})
                    .css("font-size", "1em")
                    .css("font-family", "Verdana")
                    .print()
                    .log()
                    .wait()
                    .remove()
            ]:[
                (newTimer("afterFiller", 500)
                    .start()
                    //.wait() // don't execute this pause for the moment
                )
            ])
            )
        ,
         newTimer("Timer2", 500)
            .start()
            .wait()
        ,
        newController("T", "Maze", {s: row.TargetSent, a: row.TargetDist})
            .css("font-size", "1em").css("font-family", "Verdana")
            .print()
            .log()
            .wait()
            .remove()
            .test.passed()
        ,
         newTimer("Timer3", 1000)
            .start()
            .wait()
    )
        // logs additional variables in sentence file (e.g., Fun)
        .log("ExpId", row.ExpId)
        .log("SntId", row.SntId)
        .log("Group", row.Group)
        .log("Filler", row.Filler)
    ,
    newTrial("break",

        newText("<p>Well done, you've can take a short break if you want.</p>" +
            "Press SPACE to continue.")
            .css("font-family", "Verdana")
            .center()
            .log()
            .print()
        ,
        newKey(" ")
            .wait()
    )

)

newTrial("debrief",

    newText("<p>That’s (almost) it, thank you!</p>")
        .css("font-size", "1.2em")
        .css("font-family", "Verdana")
        .print()
    ,
    newText("<p>We'd be very happy if you take a short moment to provide brief, voluntary feedback.<br/>" +
        "This information will help us with the evaluation of the results.</p>")
        .css("font-family", "Verdana")
        .print()
    ,
    newText("<p>Please indicate your handedness:</p>")
        .css("font-family", "Verdana")
        .print()
    ,
    newScale("handedness", "right-handed", "left-handed", "no dominant hand", "rather not say")
        .css("font-family", "Verdana")
        .settings.vertical()
        .labelsPosition("right")
        .print()
        .log()
    ,
    newText("<p>In a few words: How did you like this experiment? Difficult? Fun?</p>")
        .css("font-family", "Verdana")
        .print()
    ,
    newTextInput("feedback", "")
        .settings.log()
        .settings.lines(0)
        .settings.size(400, 100)
        .css("font-family", "Verdana")
        .print()
        .log()
    ,
    newText("<p>What do you think the experiment was about?</p>")
        .css("font-family", "Verdana")
        .print()
    ,

    newTextInput("topic", "")
        .settings.log()
        .settings.lines(0)
        .settings.size(400, 100)
        .css("font-family", "Verdana")
        .print()
        .log()
    ,

    newText("<p> </p>")
        .css("font-family", "Verdana")
        .print()
    ,

    newButton("send", "Save results & proceed to verification link")
        .size(300)
        .print()
        .wait()
)


SendResults("send") // send results to server before good-bye message

newTrial("goodbye",
    newText("<p>That’s it, thank you very much for your time and effort!</p>")
        .css("font-size", "1.2em")
        .css("font-family", "Verdana")
        .print()
    ,
    newText("<p><strong>Our feedback</strong>: The task tries to measure how we process sentences of varying<br/>"+
        "(presumed) complexity. Trivially, more complex sentences take longer to read, but complexity<br/>"+
        "comes in various forms and can be located in different parts of a sentence. Maze experiments<br/>"+
        "help us learn more about how people understand and process language (well at least a tiny bit!).</p>")
        .css("font-size", "1em")
        .css("font-family", "Verdana")
        .print()
    ,
    /* newText("<strong><a href='https://app.prolific.co/submissions/complete?cc=8B2C141F'>Click here to return to Prolific to validate your participation.</a></strong>")
        .css("font-size", "1em")
        .css("font-family", "Verdana")
        .print()
    ,*/
    newText("<p><br/>You can find info on the corresponding researcher <a href='https://www.sfla.ch/' target='_blank'>here</a> (opens new tab).</p>")
        .css("font-size", ".8em")
        .css("font-family", "Verdana")
        .print()
    ,
    newButton("void")
        .wait()
) // the good-bye message

.setOption( "countsForProgressBar" , false )
// Make sure the progress bar is full upon reaching this last (non-)trial
function SepWithN(sep, main, n) {
    this.args = [sep,main];

    this.run = function(arrays) {
        assert(arrays.length == 2, "Wrong number of arguments (or bad argument) to SepWithN");
        assert(parseInt(n) > 0, "N must be a positive number");
        let sep = arrays[0];
        let main = arrays[1];

        if (main.length <= 1)
            return main
        else {
            let newArray = [];
            while (main.length){
                for (let i = 0; i < n && main.length>0; i++)
                    newArray.push(main.pop());
                for (let j = 0; j < sep.length; ++j)
                    newArray.push(sep[j]);
            }
            return newArray;
        }
    }
}
function sepWithN(sep, main, n) { return new SepWithN(sep, main, n); }

_AddStandardCommands(function(PennEngine){
    this.test = {
        passed: function(){
            return !PennEngine.controllers.running.utils.valuesForNextElement ||
                !PennEngine.controllers.running.utils.valuesForNextElement.failed
        }
    }
});