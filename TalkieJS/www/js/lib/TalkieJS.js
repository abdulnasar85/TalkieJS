/*******************************************************************
 * @author Mohamed Abdul Nasar (abdul.nasar85@gmail.com)
 * Summary: TalkieJS is a voice/API Based interactive system that provides the capability to convert any
 * 			any speach to a matching API and to convert any API response to the speech.
 *******************************************************************/
define(["jquery"], function($) {
	'use strict';
	function init() {
		talkieJS.init();
	};

	var talkieJS = {

		lang : 'en-US',

		introSpeech : "Hi Guys, Welcome to TalkieJS",

		voice : "Veena",

		interimResults : false,

		maxAlternatives : 3,

		registry : [],

		yes : 'yes',

		no : 'no',

		sorryMessage : 'Sorry, I could not get what you are saying',

		init : function() {
			//	this.utils();
			this.newVoice = this.filteredVoice();
			console.log(this.newVoice);
		},

		filteredVoice : function() {
			var voices = window.speechSynthesis.getVoices();
			var filteredVoice = voices.filter(function(voi) { return voi.name == self.voice; })[0];
			console.log(filteredVoice);
			return filteredVoice;
		},

		register : function(message, type, yesCallback, noCallback) {
			if (!this.isCompatible) {
				return;
			}
			this.registry.push({
				message : message,
				yesCallback : yesCallback,
				noCallback : noCallback
			});
			this.startAction(message, type, yesCallback, noCallback);
		},

		startAction : function(message, type, yesCallback, noCallback) {
			this.init();
			this.currMessage = message;
			this.speak(message, type, yesCallback, noCallback);
		},

		startListening : function(type, yesCallback, noCallback) {
			console.log("Listening to the user..");
			var speechRecognitionObject = null;
			console.log(this.browser());
			var browser = this.browser().split(" ")[0].toLowerCase(); 
			if (browser == "chrome") {
				speechRecognitionObject = webkitSpeechRecognition;
			} else if (browser == "firefox") {
				speechRecognitionObject = mozSpeechRecognition;
			} else if (browser == "msie") {
				speechRecognitionObject = msSpeechRecognition;
			} else {
				speechRecognitionObject = SpeechRecognition;
			}

			this.recognition = new speechRecognitionObject({
				lang : this.lang,
				interimResults : this.interimResults,
				maxAlternatives : this.maxAlternatives
			});
			this.recognition.start();
			var self = this;
			console.log("Recognition started");
			this.recognition.onspeechstart =  function() {
				console.log('onspeechstart Speech recognition starts..');
			};
			this.recognition.onsoundstart =  function() {
				console.log('onsoundstart Speech recognition starts..');
			};
			this.recognition.onresult = function(event) {
				console.log('Detected message: ', event.results[0][0].transcript);
				var detectedMessage = event.results[0][0].transcript;
				if (self.yes.indexOf(detectedMessage) != -1) {
					yesCallback ? yesCallback() : null;
				} else if (self.no.indexOf(detectedMessage) != -1) {
					noCallback ? noCallback() : null;
				} else {
					this.speak(this.sorryMessage);
				}
				//this.checkRegistry(detectedMessage);
			};
		},

		browser : function() {
			var ua = navigator.userAgent, tem, M = ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
			if (/trident/i.test(M[1])) {
				tem = /\brv[ :]+(\d+)/g.exec(ua) || [];
				return 'IE ' + (tem[1] || '');
			}
			if (M[1] === 'Chrome') {
				tem = ua.match(/\b(OPR|Edge)\/(\d+)/);
				if (tem != null)
					return tem.slice(1).join(' ').replace('OPR', 'Opera');
			}
			M = M[2] ? [M[1], M[2]] : [navigator.appName, navigator.appVersion, '-?'];
			if (( tem = ua.match(/version\/(\d+)/i)) != null)
				M.splice(1, 1, tem[1]);
			return M.join(' ');
		},
		
		checkRegistry : function(detectedMessage) {
			var matches = this.registry.filter(function(reg) {
				detectedMessage.indexOf(reg.message) !== -1 ? true : false;
			});
		},
		
		justSpeak: function(message) {
			var msgUtterance = new SpeechSynthesisUtterance(message);
			msgUtterance.voice = this.newVoice;
			window.speechSynthesis.speak(msgUtterance);
		},

		speak : function(message, type, yesCallback, noCallback) {
			var msgUtterance = new SpeechSynthesisUtterance(message);
			var self = this;
			msgUtterance.voice = this.newVoice;
			window.speechSynthesis.speak(msgUtterance);
			msgUtterance.onstart = function(event) {
				console.log("Started talking..");
			};
			msgUtterance.onend = function() {
				self.startListening(type, yesCallback, noCallback);
			};
		},

		isCompatible : function() {
			if (!window.speechSynthesis) {
				console.error("Sorry, talkieJS could not be used in this browser.");
				return false;
			}
		}
	};
	return talkieJS;
});
