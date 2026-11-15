const helper = require('./helper.js');
const React = require('react');
const { useState, useEffect } = React;
const { createRoot } = require('react-dom/client');

// dropdown choices, must match the model enum
const moods = ['Happy', 'Sad', 'Angry', 'Sleepy', 'Excited'];

// domo form submit
const handleDomo = (e, onDomoAdded) => {
    e.preventDefault();
    helper.hideError();

    const name = e.target.querySelector('#domoName').value;
    const age = e.target.querySelector('#domoAge').value;
    const mood = e.target.querySelector('#domoMood').value;

    if(!name || !age || !mood) {
        helper.handleError('All fields are required');
        return false;
    }

    helper.sendPost(e.target.action, {name, age, mood}, onDomoAdded);
    return false;
}

// edit form submit, onSaved runs only if the server accepted the change
const handleEdit = (e, id, onSaved) => {
    e.preventDefault();
    helper.hideError();

    const name = e.target.querySelector('input[name="name"]').value;
    const age = e.target.querySelector('input[name="age"]').value;
    const mood = e.target.querySelector('select[name="mood"]').value;

    if(!name || !age || !mood) {
        helper.handleError('All fields are required');
        return false;
    }

    helper.sendPost('/editDomo', {id, name, age, mood}, (result) => {
        if(!result.error) {
            onSaved();
        }
    });
    return false;
}

// form for adding a domo
const DomoForm = (props) => {
    return(
        <form id="domoForm"
            onSubmit={(e) => handleDomo(e, props.triggerReload)}
            name="domoForm"
            action="/maker"
            method="POST"
            className="domoForm"
        >
            <label htmlFor="name">Name: </label>
            <input id="domoName" type="text" name="name" placeholder="Domo Name" />
            <label htmlFor="age">Age: </label>
            <input id="domoAge" type="number" min="0" name="age" />
            <label htmlFor="mood">Mood: </label>
            <select id="domoMood" name="mood">
                {moods.map(mood => <option key={mood} value={mood}>{mood}</option>)}
            </select>
            <input className="makeDomoSubmit" type="submit" value="Make Domo" />
        </form>
    );
};

// one domo, switches between display and edit form
const DomoCard = (props) => {
    const [editing, setEditing] = useState(false);
    const domo = props.domo;

    if(editing) {
        return (
            <div className="domo">
                <form className="editForm"
                    onSubmit={(e) => handleEdit(e, domo._id, () => {
                        setEditing(false);
                        props.onChanged();
                    })}
                >
                    <input type="text" name="name" defaultValue={domo.name} />
                    <input type="number" min="0" name="age" defaultValue={domo.age} />
                    <select name="mood" defaultValue={domo.mood}>
                        {moods.map(mood => <option key={mood} value={mood}>{mood}</option>)}
                    </select>
                    <input className="editSubmit" type="submit" value="Save" />
                    <button className="editCancel" type="button" onClick={() => setEditing(false)}>Cancel</button>
                </form>
            </div>
        );
    }

    return (
        <div className="domo">
            <img src="/assets/img/domoface.jpeg" alt="domo face" className="domoFace" />
            <h3 className="domoName">Name: {domo.name}</h3>
            <h3 className="domoAge">Age: {domo.age}</h3>
            <h3 className="domoMood">Mood: {domo.mood}</h3>
            <button className="editButton" type="button" onClick={() => setEditing(true)}>Edit</button>
        </div>
    );
};

// list of the user's domos, reloads when reloadDomos changes
const DomoList = (props) => {
    const [domos, setDomos] = useState(props.domos);

    const loadDomosFromServer = async () => {
        const response = await fetch('/getDomos');
        const data = await response.json();
        setDomos(data.domos);
    };

    useEffect(() => {
        loadDomosFromServer();
    }, [props.reloadDomos]);

    if(domos.length === 0) {
        return (
            <div className="domoList">
                <h3 className="emptyDomo">No Domos Yet!</h3>
            </div>
        );
    }

    const domoNodes = domos.map(domo => {
        return <DomoCard key={domo._id} domo={domo} onChanged={loadDomosFromServer} />;
    });

    return (
        <div className="domoList">
            {domoNodes}
        </div>
    );
};

// top level component, toggling reloadDomos refreshes the list
const App = () => {
    const [reloadDomos, setReloadDomos] = useState(false);

    return (
        <div>
            <div id="makeDomo">
                <DomoForm triggerReload={() => setReloadDomos(!reloadDomos)} />
            </div>
            <div id="domos">
                <DomoList domos={[]} reloadDomos={reloadDomos} />
            </div>
        </div>
    );
};

const init = () => {
    const root = createRoot(document.getElementById('app'));
    root.render( <App /> );
};

window.onload = init;
