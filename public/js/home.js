document.addEventListener('DOMContentLoaded', function() {
  
    fetchEvents();

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
                       
                    </div>
                `;
            });
        });
}