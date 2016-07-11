'use strict';

require('babel-register')

var React = require('react');
var ReactDOM = require('react-dom');
var moment = require('moment');
moment.locale('en-gb');
var DatePicker = require('react-datepicker');
require('../static/css/style.css');
require('react-datepicker/dist/react-datepicker.css');

var Option = React.createClass({
    render: function () {
        return (
            <option value="{this.props.val.id}">{this.props.val.name}</option>
        );
    }
});


var SelectList = React.createClass({
    render: function () {
        var selected = '';
        var options = [];
        this.props.values.forEach(function (val) {
            options.push(<Option val={val} key={val.id}/>);
        }.bind(this));

        return (
            <div className={this.props.cssclass}>
                <label htmlFor={this.props.id} className='select-label'>{this.props.label}</label><select className='select-form' value="{selected}" id={this.props.id}>
                    {options}
                </select>
            </div>
        );
    }
});


var JNTDatePicker = React.createClass({
    render: function () {
        return (
            <div className='jnt-picker'>
                <label htmlFor='date' >Date</label>
                <div style={{ display: 'table-cell' }} >
                    <DatePicker selected={this.props.date} onChange={this.handleChange} dateFormat='DD/MM/YYYY' filterDate={this.isWeekday}  locale='en-gb'  excludeDates={this.props.jnt}/>

                    <input type='button' onClick={this.previousDay} value='Jour précédent'  className="button" style={{ display: 'table-cell' }}/>
                    <input type='button' onClick={this.nextDay} value='Jour suivant'  className="button" style={{ display: 'table-cell' }}/>
                </div>
            </div>
        );
    },

    isWorkingDay: function (d) {
        for (var i = 0; i < this.props.jnt.length; i++) {
            if (this.props.jnt[i].format('YYYY-MM-DD') == d.format('YYYY-MM-DD')) {
                return false;
            }
        }
        return this.isWeekday(d);
    },

    previousDay: function () {
        var d = this.props.date.clone().add(-1, 'day');
        while (!this.isWorkingDay(d)) {
            d.add(-1, 'day');
        }
        this.props.changeDate(d);
    },
    nextDay: function () {
        var d = this.props.date.clone().add(1, 'day');
        while (!this.isWorkingDay(d)) {
            d.add(1, 'day');
        }
        this.props.changeDate(d);
    },
    handleChange: function (d) {
        this.props.changeDate(d);
    },

    isWeekday: function (d) {
        var dow = d.weekday();
        return dow < 5;
    }
});

var Comment = React.createClass({
    render: function () {
        return (
            <div className='comment'><label htmlFor='comment' className='comment-label'>Remarque</label><textarea id='comment'/></div>
        );
    }
});

var Timetable = React.createClass({
    getInitialState: function () {
        return {
            today: moment(),
            weeklyTasks: TASKS,
        };
    },
    dailyTasks: function () {
        var today = this.state.today.format('YYYY-MM-DD');
        if (today in this.state.weeklyTasks) {
            return this.state.weeklyTasks[today];
        }
        return [];
    },
    render: function () {
        var dailyTasks = this.dailyTasks();
        return (
            <div>
                <form className='task-table'>
                    <SelectList values={USERS} label='Trigramme' cssclass='user'/>
                    <JNTDatePicker jnt={JNT} date={this.state.today} changeDate={this.changeDate}/>
                    <SelectList values={PROJECTS} label='Projet' cssclass='project-select' id='project'/>
                    <SelectList values={ACTIVITIES} label='Activité' cssclass='activity-select' id='activity'/>
                    <SelectList values={ALLOCATION} label='Temps' cssclass='allocation-select' id='allocation'/>
                    <Comment />
                    <div style={{ display: 'table-row' }}>
                        <input type='button' onClick={this.addTime} value='Ajouter cette tâche'  style={{ display: 'table-cell' }}/>
                    </div>
                </form>
                <hr/>
                <DailySummary tasks={dailyTasks} deleteTasks={this.deleteDailyTasks}/>
                <hr/>
                <WeeklySummary tasks={this.state.weeklyTasks} date={this.state.today}/>
            </div>
        );
    },
    deleteDailyTasks: function (indexes) {
        var dailyTasks = [];
        var oldTasks = this.dailyTasks();
        for (var i = 0; i < oldTasks.length; i++) {
            if (indexes.indexOf(i) >= 0) {
                continue;
            }
            dailyTasks.push(oldTasks[i]);
        }
        var weeklyTasks = this.state.weeklyTasks;
        var today = this.state.today.format('YYYY-MM-DD');
        weeklyTasks[today] = dailyTasks;
        this.setState({ weeklyTasks: weeklyTasks });
    },
    changeDate: function (d) {
        this.setState({ today: d });
    },
    addTime: function () {
        console.log('add time');
    }
});


var DailyTask = React.createClass({
    getInitialState: function () {
        return {
            checked: false
        };
    },
    render: function () {
        return (
            <tr><td><input type="checkbox" value={this.state.checked} onChange={this.handleClick}/></td><td>{this.props.project.name}</td><td>{this.props.activity.name}</td><td>{this.props.allocation.name}</td></tr>
        );
    },
    handleClick: function () {
        var newState = !this.state.checked;
        this.setState({ checked: newState });
        this.props.handleTaskClick(this.props.index, newState);
    }
});

var DailySummary = React.createClass({
    getInitialState: function () {
        return {
            checkedIndexes: {},
        };
    },
    render: function () {
        var rows = [];
        var i = 0;
        this.props.tasks.forEach(function (task) {
            rows.push(<DailyTask project={task.project} key={task.id} index={i} activity={task.activity} allocation={task.allocation} handleTaskClick={this.handleTaskClick}/>);
            i++;
        }.bind(this));
        return (
            <table>
                <caption>Journée en cours</caption>
                <tbody>
                    <tr>
                        <th>&nbsp; </th><th>Projet</th><th>Activité</th><th>Temps</th>
                    </tr>
                    {rows}
                    <tr><td colSpan="4"><input type="button" value="Effacer les tâches" onClick={this.deleteTasks}/></td></tr>
                </tbody>
            </table>
        );
    },
    deleteTasks: function () {
        var indexes = [];
        for (var k in this.state.checkedIndexes) {
            if (this.state.checkedIndexes[k])
                indexes.push(parseInt(k));
        }
        this.props.deleteTasks(indexes);
        this.setState({ checkedIndexes: {} });
    },
    handleTaskClick: function (index, checked) {
        var checkedIndexes = {};
        for (var k in this.state.checkedIndexes) {
            checkedIndexes[k] = this.state.checkedIndexes[k];
        }
        checkedIndexes[index] = checked;
        this.setState({ checkedIndexes: checkedIndexes });
    }
});

var WeeklySummary = React.createClass({
    render: function () {
        var dow = this.props.date.weekday();
        var days = {};
        var projects = new Set();
        for (var i = 0; i < 5; i++) {
            var key = this.props.date.clone().add(i - dow, 'day').format('YYYY-MM-DD');
            days[i] = {};
            if (key in this.props.tasks) {
                var dailyProject = this.props.tasks[key];

                for (var j = 0; j < dailyProject.length; j++) {
                    days[i][dailyProject[j].project.name] = dailyProject[j].allocation;
                    projects.add(dailyProject[j].project.name);
                }
            }
        }

        var rows = [];
        var total = 0;
        var sumDays = {}

        projects.forEach(function (p) {
            var projectdays = {};
            var projectTotal = 0;
            for (var i = 0; i < 5; i++) {
                if (!(p in days[i])) {
                    projectdays[i] = '';
                } else {
                    projectdays[i] = days[i][p];
                    projectTotal += days[i][p].value;
                    total += days[i][p].value;
                }
            }
            rows.push(<tr key={p}><td></td><td>{p}</td><td>{projectdays['0'].name}</td><td>{projectdays['1'].name}</td><td>{projectdays['2'].name}</td><td>{projectdays['3'].name}</td><td>{projectdays['4'].name}</td><td>{projectTotal}</td></tr>)
        }.bind(this));
        return (
            <table>
                <caption>Semaine en cours</caption>
                <tbody>
                    <tr>
                        <th>Volet</th><th>Projet</th><th>Lundi</th><th>Mardi</th><th>Mercredi</th><th>Jeudi</th><th>Vendredi</th><th>Total</th>
                    </tr>
                    {rows}
                    <tr><td><strong>Total</strong></td><td></td><td>{sumDays['0']}</td><td>{sumDays['1']}</td><td>{sumDays['2']}</td><td>{sumDays['3']}</td><td>{sumDays['4']}</td><td>{total}</td></tr>
                </tbody>
            </table>
        );
    },
});

var USERS = [
    { id: 0, name: 'JFY' },
    { id: 1, name: 'PCN' },
    { id: 2, name: 'BDS' },
]

var JNT = ['2016-01-29', '2016-02-26', '2016-03-25', '2016-04-15', '2016-05-06', '2016-07-15', '2016-08-26', '2016-10-31', '2016-12-26', '2016-12-27'];

for (var i = 0; i < JNT.length; i++) {
    JNT[i] = moment(JNT[i], 'YYYY-MM-DD');
}

var TASKS = {
    '2016-07-04': [{ id: 0, activity: { id: 0, name: 'Activity 1' }, project: { id: 0, name: 'Project A' }, allocation: { id: 0, name: '1', value: 1 }, date: '2016-07-04' }],
    '2016-07-05': [{ id: 1, activity: { id: 0, name: 'Activity 1' }, project: { id: 0, name: 'Project A' }, allocation: { id: 0, name: '1', value: 1 }, date: '2016-07-05' },
        { id: 2, activity: { id: 0, name: 'Activity 2' }, project: { id: 0, name: 'Project b' }, allocation: { id: 2, name: '1/2', value: 0.5 }, date: '2016-07-05' }]
}

var PROJECTS = [
    { id: 0, name: 'Project A' },
    { id: 1, name: 'Project B' },
    { id: 2, name: 'Project C' },
]

var ACTIVITIES = [
    { id: 0, name: 'Activity 1' },
    { id: 1, name: 'Activity 2' },
    { id: 2, name: 'Activity 3' },
]

var ALLOCATION = [
    { id: 0, name: '1', value: 1 },
    { id: 1, name: '3/4', value: 0.75 },
    { id: 2, name: '1/2', value: 0.5 },
    { id: 3, name: '1/4', value: 0.25 },
]

ReactDOM.render(
    <Timetable />,
    // <FilterableProductTable products={PRODUCTS} />,
    document.getElementById('container')
);