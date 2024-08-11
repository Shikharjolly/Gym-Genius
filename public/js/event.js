let button = document.getElementById('submit-button');

document.addEventListener('DOMContentLoaded', function() {
    fetchEvents();
    document.getElementById('event-form').addEventListener('submit', function(e) {
        e.preventDefault();
        saveEvent();
    });
});

function fetchEvents() {
    fetch('/api/events')
        .then(response => response.json())
        .then(events => {
            const eventList = document.getElementById('event-list');
            eventList.innerHTML = '';
            events.forEach(element => {
                eventList.innerHTML += `
                    <div class="event-item">
                    
                        <h3>Event: ${element.name}</h3>
                        <p>ID: ${element._id}</p>
                        <p>Date: ${new Date(element.date).toLocaleDateString()}</p>
                        <p>Location: ${element.location}</p>
                        <p>Description: ${element.description}</p>
                        <p>Availability: ${element.availability}</p>
                        <button id = "delete-button" onclick="deleteEvent('${element._id}')">Delete</button>
                        <button id = "edit-button" onclick = "editEvent('${element._id}')">Edit</button>
                    </div>
                `;
            });
        });
}

function saveEvent() {
    const id = document.getElementById('event-id').value;
    const name = document.getElementById('name').value;
    const date = document.getElementById('date').value;
    const location = document.getElementById('location').value;
    const description = document.getElementById('description').value;

    const event = { name, date, location, description };

    const method = id ? 'PUT' : 'POST';
    const url = id ? `/api/events/${id}` : '/api/events';

    fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event)
    })
        .then(response => response.json())
        .then(() => {
            fetchEvents();
            document.getElementById('event-form').reset();
            document.getElementById('event-id').value = '';
        });
        if (button.innerText = "Edit Event")
            button.innerText = "Save Event";
}

function deleteEvent(id) {
    fetch(`/api/events/${id}`, { method: 'DELETE' })
        .then(() => fetchEvents());
}

function editEvent(id) {
  
    button.innerText = "Edit Event"

    fetch(`/api/events/${id}`, { method: 'PUT' })
        .then(response => response.json())
        .then(event => {
            document.getElementById('event-id').value = event._id;
            document.getElementById('name').value = event.name;
            document.getElementById('date').value = new Date(event.date).toISOString().split('T')[0];
            document.getElementById('location').value = event.location;
            document.getElementById('description').value = event.description;
        });
       
}
