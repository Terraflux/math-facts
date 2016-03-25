/**
    Copyright 2014-2015 Amazon.com, Inc. or its affiliates. All Rights Reserved.

    Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at

        http://aws.amazon.com/apache2.0/

    or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

/**
 * This simple sample has no external dependencies or session management, and shows the most basic
 * example of how to create a Lambda function for handling Alexa Skill requests.
 *
 * Examples:
 * One-shot model:
 *  User: "Alexa, ask Math Fact for a math fact"
 *  Alexa: "Here's your math fact: ..."
 */

/**
 * App ID for the skill
 */
var APP_ID = "amzn1.echo-sdk-ams.app.e206d443-3907-480d-be84-08f67c053bd2"; //replace with "amzn1.echo-sdk-ams.app.[your-unique-value-here]";

/**
 * Array containing math facts.
 */
var MATH_FACTS = [
    "An integer is divisible by 9 if the sum of its digits is divisible b 9.",
    "The number 0 does not have its own roman numeral.",
    "'How I wish I could calculate pi'. The number of letters in each word of that sentence correspond to the first 7 digits of pi.",
    "The first number to contain the letter a is one thousand",
    "The only number to have its letters in alphabetical order is forty.",
    "The numbers on opposite sides of a dice add up to 7.",
    "Two is the only even prime number.",
    "It should take no more than 20 moves to solve any configuration of a rubik's cube.",
    "A dodecahedron has twelve equal pentagonal sides.",
    "A googol is one followed by 100 zeroes, it can be written as 10 to the 100.",
    "eulers number to the power of i times pi is equal to -1",
    "Triangles, squares and hexagons are the only regular polygons that tesselate.",
    "The equal sign was invented in 1557 by welsh mathematician Robert Recorde.",
    "In a class of 23 people, the probability two have the same birthday is more than half.",
    "42 is the answer to the 'Ultimate Question of Life, the Universe, and Everything'",
    "18 is the only number that is twice the sum of its digits.",
    "The polar diameter of the earth is within 0.1% of half a billion inches.",
    "The Feynman Point is the 762nd position of pi, the first time a digit repeats itself six times, a nine.",
    "The billionth digit of pi is 9.",
    "A vinculum is the correct name for the division bar in a fraction.",
    "2520 is the smallest number that is divisible by all the integers.",
    "Moving each letter of the word yes 16 places higher in the alphabet produces the french word for yes, 'oui'",
    "The word twelve is worth twelve words in scrabble.",
    "A polygon with a million sides is called a megagon.",
    "A unique prime is a number for which there exists no prime number such that the period length of their two reciprocals are equal. There are only 23 of these below 10 to the 100.",
    "A Mersenne prime is a prime number that is one less than a power of two.",
    "The largest currently known prime number was found by the Great Internet Mersenne Prime Search in January 2016. It is 2 to the seventy four million two hundred seven thousand two hundred eighty first power minus one.",
    "A taxicab number is the smallest number that can be expressed as the sum of two cubes in n distinct ways. It is named after Hardy & Ramanujan for remarking about the interestingness of the number on a taxicab. 1729, the smallest number expressible as the sum of two cubes in two different ways: 1 to the 3 plus 12 to the 3, and 9 to the 3 plus 10 to the 3.",
    "The fundamental theorem of arithmetic states that every integer greater than 1 is either prime, or the product of prime numbers, and that this product is unique up to the order of the factors.",
    "A perfect number is a positive integer that is equal to the sum of its proper positive divisors. 6 is the first perfect number because it is divided by one, two, and three, which also add up to 6. There are no known odd perfect numbers.",
    "An abundant number is a positive integer for which the sum of its proper divisors is greater than the integer itself. Twelve is the first abundant number because its divisors, 1, 2, 3, 4, and 6 add up to 16, therefore it's abundance is 16 - 12 = 4. The smallest odd abundant number is 945.",
    "A deficient number is a positive integer for which the sum of its proper divisors is less than the integer itself.",
    "Amicable numbers are related such that the sum of each of their proper divisors are equal to one another's. The smallest amicable pair are two hundred twenty and two hundred eighty four.",
    "Friendly numbers are related such that they share an abundancy(the sum of their proper positive divisors exceed the integer itself by the same amount). The smallest friendly pair is 6 and 28, they share an abundancy of 2."
];

/**
 * The AlexaSkill prototype and helper functions
 */
var AlexaSkill = require('./AlexaSkill');

/**
 * MathFacts is a child of AlexaSkill.
 * To read more about inheritance in JavaScript, see the link below.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Introduction_to_Object-Oriented_JavaScript#Inheritance
 */
var MathFacts = function () {
    AlexaSkill.call(this, APP_ID);
};

// Extend AlexaSkill
MathFacts.prototype = Object.create(AlexaSkill.prototype);
MathFacts.prototype.constructor = MathFacts;

MathFacts.prototype.eventHandlers.onSessionStarted = function (sessionStartedRequest, session) {
    console.log("MathFacts onSessionStarted requestId: " + sessionStartedRequest.requestId
        + ", sessionId: " + session.sessionId);
    // any initialization logic goes here
};

MathFacts.prototype.eventHandlers.onLaunch = function (launchRequest, session, response) {
    console.log("MathFacts onLaunch requestId: " + launchRequest.requestId + ", sessionId: " + session.sessionId);
    handleNewFactRequest(response);
};

/**
 * Overridden to show that a subclass can override this function to teardown session state.
 */
MathFacts.prototype.eventHandlers.onSessionEnded = function (sessionEndedRequest, session) {
    console.log("MathFacts onSessionEnded requestId: " + sessionEndedRequest.requestId
        + ", sessionId: " + session.sessionId);
    // any cleanup logic goes here
};

MathFacts.prototype.intentHandlers = {
    "GetNewFactIntent": function (intent, session, response) {
        handleNewFactRequest(response);
    },

    "AMAZON.HelpIntent": function (intent, session, response) {
        response.ask("You can ask Math Facts tell me a math fact, or, you can say exit... What can I help you with?", "What can I help you with?");
    },

    "AMAZON.StopIntent": function (intent, session, response) {
        var speechOutput = "Goodbye";
        response.tell(speechOutput);
    },

    "AMAZON.CancelIntent": function (intent, session, response) {
        var speechOutput = "Goodbye";
        response.tell(speechOutput);
    }
};

/**
 * Gets a random new fact from the list and returns to the user.
 */
function handleNewFactRequest(response) {
    // Get a random math fact from the math facts list
    var factIndex = Math.floor(Math.random() * MATH_FACTS.length);
    var fact = MATH_FACTS[factIndex];

    // Create speech output
    var speechOutput = "Here's a math fact: " + fact;

    response.tellWithCard(speechOutput, "MathFacts", speechOutput);
}

// Create the handler that responds to the Alexa Request.
exports.handler = function (event, context) {
    // Create an instance of the MathFacts skill.
    var mathFacts = new MathFacts();
    mathFacts.execute(event, context);
};

