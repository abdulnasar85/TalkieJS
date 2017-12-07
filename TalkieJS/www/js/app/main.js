define(["jquery", "../TalkieJS"], function($, talkiejs) {
    $(function() {
        var talk = talkiejs;
        talk.speak("hey buddy..");
        talk.start();
    });
});
