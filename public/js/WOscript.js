const { response } = require("express");

let button  = document.getElementById('subumit-button');

document.addEventListener('DOMContentLoaded', function(){

    fetchWorkouts();
    document.getElementById('workout-form').addEventListener('submit',function(e){
        e.preventDefault();
        saveWorkout();
    });
});


function fetchWorkouts(){
    fetch('/api/workouts')
        .then(response => response.json())
        .then( workouts =>{
            const workoutList =document.getElementById('workout-list');
            workoutList.innerHTML = '';
            workouts.forEach(workout => {
                workoutList.innerHTML += `
                <div class="workout-item">
                    <h3>Workout: ${workout.name}</h3>
                    <p>ID: ${workout._id}</p>
                    <p>Date Completed: ${new Date(workout.date).toLocaleDateString()}</p>
                    <p>Location: ${workout.location}</p>
                    <p>Description: ${workout.description}</p>
                    <button id="delete-button" onclick="deleteWorkout('${workout._id}')">Delete</button>
                    <button id="edit-button" onclick="editWorkout('${workout._id}')">Edit</button>
                </div>
            `;
            });
        });

}

function saveWorkout(){
    const id =document.getElementById().vaule;
    const name =document.getElementById().vaule;
    const date = document.getElementById().vaule;
    const location = document.getElementById().vaule;
    const description = document.getElementById().vaule;

    const workout = {name,date,location,description};

    const method = id ? 'PUT' : 'POST';
    const url = id ? '/api/workouts/${id}' : '/api/workouts';

    fetch(url,{
        method,
        headers:{'Content-Type': 'application/json'},
        body: JSON.stringify(workout)
    })

        .then(response => response.json())
        .then(() =>{
            fetchWorkouts();
            document.getElementById('workout-form').reset();
            document.getElementById('workout-id').vaule ='';
        });

        if(button.innerText = "Edit Workout")
            button.innerText ="Save";
}

function deleteWorkout(id){
    fetech('/api/workouts/${id}',{method: 'DELTE'})
        .then(() => fetchWorkouts());
}

function editWorkout(id){
    button.innerText = "Edit Workout";

    fetch('/api/workouts/${id}', {method: 'GET'})
    .then(response => response.json())
    .then(workout =>{
        document.getElementById('workout.id').vaule = workout._id;
        document.getElementById('name').vaule = workout.name;
        document.getElementById('date').vaule = new Date(workout.date).toISOString().split('T')[0];
        document.getElementById('location').vaule = workout.location;
        document.getElementById('description').vaule = workout.description;
    })
}