/*
 * @author Rijn
 */
;
(function(window, document, undefined) {
    "use strict";

    var include = function(arr, obj) {
        return (arr.indexOf(obj) != -1);
    };

    function Quiz(options) {
        var self = this;

        if (!(self instanceof Quiz)) {
            return new Quiz(options);
        };

        self.options = options || {};

        if (!!self.options.colors) {
            self.import(self.options.colors);
        };
    };

    Quiz.prototype = {
        items: [],
        import: function(questions) {
            this.items = $.extend([], this.items, questions);
        },
        score: [],
        types: {
            'single': {
                template: '<div class="question question-single" data-id="${id}">\
                    <div class="left">\
                        <span>${displayId}</span>\
                    </div>\
                    <div class="right">\
                        <div class="description">\
                            <span>${question}</span>\
                        </div>\
                        <div class="options">\
                        {{each options}}\
                            <div class="option correct-${$value.correct}">\
                                <span>${$value.item}</span>\
                                <div class="explanation">${$value.explanation}</div>\
                            </div>\
                        {{/each}}\
                        </div>\
                        <div class="show-all"><span>Show all explanations</span></div>\
                    </div>\
                </div>',
                judger: function(question, data) {
                    question.on('click', '.option', (function(_this) {
                        return function() {
                            $(this).addClass('selected');
                            var parent = $(this).parentsUntil(".question").parent();
                            if (!_this.score.hasOwnProperty(parent.data('id'))) {
                                parent.addClass('answered');
                                _this.score[parent.data('id')] = $(this).hasClass('correct-true');
                                _this.refreshScore(1);
                            }
                        };
                    }(this)));
                    question.on('click', '.show-all', function() {
                        $(this).parent().children(".options").children().addClass('selected');
                    });

                },
            },
            'multiple': {
                template: '<div class="question question-multiple" data-id="${id}">\
                    <div class="left">\
                        <span>${displayId}</span>\
                    </div>\
                    <div class="right">\
                        <div class="description">\
                            <span>${question}</span>\
                        </div>\
                        <div class="options">\
                        {{each options}}\
                            <div class="option" data-item="${$value.item}">\
                                <span>${$value.item}</span>\
                                <div class="explanation">${$value.explanation}</div>\
                            </div>\
                        {{/each}}\
                        </div>\
                        <div class="submit"><span>Submit</span></div>\
                        <div class="result"><span></span></div>\
                    </div>\
                </div>',
                judger: function(question, data) {
                    question.on('click', '.option', function() {
                        if ($(this).hasClass('selected')) {
                            $(this).removeClass('selected');
                        } else {
                            $(this).addClass('selected');
                        }
                    });

                    question.on('click', '.submit', (function(_this) {
                        return function() {
                            var parent = $(this).parent();
                            var question = $(this).parentsUntil(".question").parent();
                            var result = [];
                            parent.children('.options').children('.option').each(function() {
                                if ($(this).hasClass('selected')) result.push($(this).data('item'));
                            })
                            switch (result.length) {
                                case 0:
                                    parent.children('.result').children('span').text("Please select at least one word");
                                    parent.children('.result').removeClass('correct-false correct-true').addClass('correct-false');
                                    break;
                                case 1:
                                    parent.children('.result').children('span').text("Your answer is incomplete.  Please select another word.");
                                    parent.children('.result').removeClass('correct-false correct-true').addClass('correct-false');
                                    break;
                                case 2:
                                    if (include(data.answer, result[0])) {
                                        if (include(data.answer, result[1])) {
                                            parent.children('.result').children('span').text("Yes!  It is hard to believe that words we take for granted in computing were once so new.");
                                            parent.children('.result').removeClass('correct-false correct-true').addClass('correct-true');
                                            var question = $(this).parentsUntil(".question").parent();
                                            if (!_this.score.hasOwnProperty(question.data('id'))) {
                                                _this.score[question.data('id')] = 1;
                                            }
                                            break;
                                        } else {
                                            parent.children('.result').children('span').text(
                                                "Incorrect: You picked " + result[0] + " correctly, but " + result[1] + " is one of the words that Professors Gotlieb and Hume got credit for."
                                            );
                                            parent.children('.result').removeClass('correct-false correct-true').addClass('correct-false');
                                            break;
                                        }
                                    } else {
                                        if (include(data.answer, result[1])) {
                                            parent.children('.result').children('span').text(
                                                "Incorrect: You picked " + result[1] + " correctly, but " + result[0] + " is one of the words that Professors Gotlieb and Hume got credit for."
                                            );
                                            parent.children('.result').removeClass('correct-false correct-true').addClass('correct-false');
                                            break;
                                        } else {
                                            parent.children('.result').children('span').text("Incorrect: Both words you chose are words that Professors Gotlieb and Hume were quoted for in the OED.");
                                            parent.children('.result').removeClass('correct-false correct-true').addClass('correct-false');
                                            break;
                                        }
                                    }
                                    break;
                                default:
                                    parent.children('.result').children('span').text("Only two words can be selected. Please try again.");
                                    parent.children('.result').removeClass('correct-false correct-true').addClass('correct-false');
                                    break;
                            }
                            if (!_this.score.hasOwnProperty(question.data('id'))) {
                                _this.score[question.data('id')] = 0;
                            }
                            _this.refreshScore(1);
                        };
                    }(this)));
                },
            },
            'matching':{
                template: '<div class="question question-matching" data-id="${id}">\
                    <div class="left">\
                        <span>${displayId}</span>\
                    </div>\
                    <div class="right">\
                        <div class="description">\
                            <span>${question}</span>\
                            <br></br>\
                            <span> (Input names in order, use comma to seperate) </span>\
                        </div>\
                        \
                        <div class="options" >\
                        {{each options}}\
                            <div class="option" data-item="${$value.item}">\
                                <span>${$value.item}</span>\
                                <div class="explanation">${$value.explanation}</div>\
                            </div>\
                        {{/each}}\
                        </div>\
                        \
                        <div class="names">\
                        {{each names}}\
                            <div class="name" data-item="${$value.a}">\
                                <span>${$value.a}</span>\
                            </div>\
                        {{/each}}\
                        </div>\
                        \
                        <input class = "answer" type="text" id="inputName">\
                        </input>\
                        <div class="submit"><span>Submit</span></div>\
                        <div class="result"><span></span></div>\
                        <div class="show-all"><span>Show all explanations</span></div>\
                    </div>\
                </div>',
                judger:function(question, data){
                        question.on('click', '.submit', (function(_this) {

                            return function(){
                                var count = 0;
                                var parent = $(this).parent();
                                var answer = document.getElementById("inputName").value.split(",");
                                var exp = parent.children('.options').children('.option').children('.explanation').text();
                                var exp_set = exp.split("  ");
   //                             console.log(exp_set);
                                var k =0;
                                for (var k in answer){
                                    if (answer[k] == exp_set[k]){
                                        count = count + 0.125;
                                        exp_set.splice(k,1);
                                    }
//                                    console.log(count);
                                }
                                var question = $(this).parentsUntil(".question").parent();
                                question.addClass('answered');
                                _this.score[question.data('id')] = count;
                                _this.refreshScore();
                                if (count == 1){
                                    parent.children('.result').children('span').text("Congratulations! Your pairing is correct!");
                                    parent.children('.result').removeClass('correct-false correct-true').addClass('correct-true');
                                }
                                else{
                                    parent.children('.result').children('span').text("The following names are incorrect pairing with thier fames: "+ exp_set);
                                    parent.children('.result').removeClass('correct-false correct-true').addClass('correct-false');

                                }
                            };

                        }(this)));
                        question.on('click', '.show-all', function() {
                            $(this).parent().children(".options").children().addClass('selected');
                        });
                    },
            },
            'arrange':{
                template: '<div class="question question-arrange" data-id="${id}">\
                    <div class="left">\
                        <span>${displayId}</span>\
                    </div>\
                    <div class="right">\
                        <div class="description">\
                            <span>${question}</span>\
                            <br></br>\
                            <span> (choose 1 to 7 from oldest to newest, write them in the box without space) </span>\
                        </div>\
                        \
                        <div class="options" >\
                        {{each options}}\
                            <div class="option" data-item="${$value.item}">\
                                <span>${$value.item}</span>\
                                <div class="explanation">${$value.explanation}</div>\
                                <div class = "index">${$value.index}</div>\
                            </div>\
                        {{/each}}\
                        </div>\
                        <input class ="inputRanking" id = "inputAnswer" type="text" >\
                        </input>\
                        <div class="submit"><span>Submit</span></div>\
                        <div class="result"><span></span></div>\
                        <div class="show-all"><span>Show all explanations</span></div>\
                    </div>\
                </div>',
                judger:function(question, data){
                    question.on('click', '.submit', (function(_this) {
                        return function(){
                            var parent = $(this).parent();

                            var question = $(this).parentsUntil(".question").parent();
                            question.addClass('answered');
                            
                            var answer = document.getElementById("inputAnswer").value;
                            var exp = parent.children('.options').children('.option').children('.index').text();

                            var k =0;
                            var count =0;
                            for (var k in answer){
                                if (answer[k] == exp[k])
                                    count += 1;

                            }

                            if (count == 7){
                                _this.score[question.data('id')] = 1;
                                parent.children('.result').children('span').text("Congratulations! Your ranking is correct!");
                                parent.children('.result').removeClass('correct-false correct-true').addClass('correct-true');
                            }
                            else{
                                _this.score[question.data('id')] = 0;
                                parent.children('.result').children('span').text("Sorry you're wrong. Please see the correct year. The correct ranking of these inventions should be " + exp);
                                parent.children('.result').removeClass('correct-false correct-true').addClass('correct-false');

                            }

                            _this.refreshScore();
                                
                        };

                }(this)));

                question.on('click', '.show-all', function() {
                    $(this).parent().children(".options").children().addClass('selected');
                });

            },                

            },
        },


        shuffle: function(a) {
            var j, x, i;
            for (i = a.length; i; i--) {
                j = Math.floor(Math.random() * i);
                x = a[i - 1];
                a[i - 1] = a[j];
                a[j] = x;
            }
        },

        refreshScore: function(count) {
            var totalCount = 0,
                correctCount = 0;
            
            for (var i in this.items) {
                totalCount = this.items[i]['score'] + totalCount;}

            for (var key in this.score) {
                if (this.score.hasOwnProperty(key)) {
                    correctCount = correctCount + this.score[key];
                }
            }
            $("#grade").text('Grade ' + correctCount + '/' + totalCount);
        },
        render: function(parent) {

            if (this.options.shuffle) {
                this.shuffle(this.items);
                for(var i in this.items){
                    this.shuffle(this.items[i]['options']);
                }
            };

            for (var key in this.items) {
                if (this.items.hasOwnProperty(key)) {
                    var type = this.types[this.items[key].type];
                    $(parent).append($.tmpl(type.template, $.extend({}, this.items[key], { id: key, displayId: 'Q' + (Number(key) + 1) })));
                    type.judger && type.judger.call(this, $(parent).children('div:last-child'), this.items[key]);
                }
            }

        },
    };

    window.Quiz = Quiz;

})(window, document);

questions = [{
    type: 'single',
    question: 'The first electronic computer in Canada was housed in the Computer Science Department at the U of T.  What was its name?',
    options: [{
        item: "HAL 9000",
        correct: false,
        explanation: "The HAL 9000 is a fictional computer from Arthur C. Clarke's 2001: A Space Odyssey.",
    }, {
        item: "FERUT",
        correct: true,
        explanation: "The machine arrived in Canada on April 30, 1952.  Named FERUT (FERranti U of T), it was used to compute changes in water levels due to the opening of the St. Lawrence Seaway.",
    }, {
        item: "ILLIAC",
        correct: false,
        explanation: "The ILLIAC was built at the University of Illinois. It was the first von Neumann architecture computer built and owned by an American university. It was put into service on September 22, 1952.",
    }, {
        item: "UNIVAC",
        correct: false,
        explanation: "The UNIVAC was the first commericial computer produced in the United States, and was designed by J. Presper Eckert and John Mauchly.  The United States Census Department received delivery of the first UNIVAC in May 1952.",
    }, ],
    score: 1,
}, {
    type: 'multiple',
    question: 'University of Toronto Professors Kelly Gotlieb and Pat Hume are credited in the Oxford English Dictionary with early published use of more than 10 words used in the vocabulary of computing from their 1958 book, "High-speed Data Processing". Which two of the following are * not * words for which they are quoted in the OED ?',
    options: [{
        item: "loop",
    }, {
        item: "inline",
    }, {
        item: "keyboard",
    }, {
        item: "interpreter",
    }, {
        item: "function",
    }, {
        item: "block",
    }, {
        item: "character",
    }, {
        item: "variable",
    }, ],
    answer: ["variable", "function"],
    response: {
        'correct': 'Yes!  It is hard to believe that words we take for granted in computing were once so new.',
        'oneWordCorrect': "Incorrect: You picked ${correctWord} correctly, but ${incorrectWord} is one of the words that Professors Gotlieb and Hume got credit for.",
        "neitherWordCorrect": "Incorrect: Both words you chose are words that Professors Gotlieb and Hume were quoted for in the OED.",
    },
    score : 2,
},{
    type:'matching',
    question:'Match the CS Professor with his or her claim to fame:',
    options: [{
        explanation: " Daniel Wigdor ",
        item:"Taught a first-year course while an undergraduate student in our department",
    },{
        explanation:" Stephen Cook ",
        item:"Turing Award winner for work in computational complexity",
    },{
        explanation:" Geoff Hinton ",
        item: "Pioneer in machine learning, now Distinguished Researcher at Google",
    },{
        explanation:" Karan Singh ",
        item:"Academy Award for Ryan (software research and development director)",
    },{
        explanation:" Diane Horton ",
        item:"Winner of both the President's Teaching Award and OCUFA teaching award",
    },{
        explanation:" Raquel Urtasun ",
        item:"Canada Research Chair in Machine Learning and Computer Vision, researching self-driving cars",
    },{
        explanation:" David Levin ",
        item:"Associate Research Scientist at Disney Research before joining the faculty",
    },{
        explanation:" Mike Brudno",
        item:"Scientific Director of the Centre for Computational Medicine at Sick Kids Hospital",
    },],
    score: 4,
    names: [{
        a:"Daniel Wigdor" ,
    },{
        a:"Stephen Cook"  ,
    },{
        a:"Geoff Hinton" ,
    },{
        a:"Karan Singh" ,
    },{
        a: "Diane Horton",
    },{
        a:"Raquel Urtasun" ,
    },{
        a:"David Levin" ,
    },{
        a:"Mike Brudno" ,
    },],
},{
    type:'arrange',
    question:'Arrange by year of invention from oldest to newest:',
    options:[{
        item: "The First Computer Network",
        explanation: "1940",
        index: 2,
    },{
        item: "First Microprocessor: Intel 4004",
        explanation: "1971",
        index: 7,
    },{
        item: "First Popular High-Level Language: FORTRAN ",
        explanation: "1957 (John Backus)",
        index: 5,
    },{
        item: "First Open Source Software: A-2 System",
        explanation: "1953",
        index: 4,
    },{
        item: "First Compiler for Electronic Computer: A-0 System",
        explanation: "1951 (Grace Hopper)",
        index: 3,
    },{
        item: "First Computer Program",
        explanation: "1841 (Ada Lovelace)",
        index: 1, 
    },{
        item: "First Object Oriented Programming Language: Simula",
        explanation: "1967 (Ole-Johan Dahl and Kristen Nygaard)",
        index: 6,
    },],
    score: 1,
}];

$(document).ready(function() {
    var quiz = new Quiz({ shuffle: true });
    quiz.import(questions);
    quiz.refreshScore();
    quiz.render($('#list'));
});
