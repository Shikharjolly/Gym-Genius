const { response } = require("express");

/** 
  
  fetch('/user/123')
    .then(response => response.json())
    .then(user =>{
      document.getElementById('profile-photo').src= user.profilePhoto || 'deault-profilr.png';
      document.getElementById('profile-name').textContent ='${user.firstName} ${user.lastName}';
      document.getElementById('profile-bio').textContent = user.bio || 'No bio available'
    });*/
  
   // Profile and event fetching code
    document.addEventListener('DOMContentLoaded', async () => {
   
      const token = localStorage.getItem('token');
        if (!token) {
          window.location.href = 'login.html';
          return;
        }
    
          // Fetch profile data
      const response = await fetch('/profile', {
          headers: { 'Authorization': token }
      });
    
        if (response.ok) {
          const user = await response.json();
          document.getElementById('username').innerText = `Username: ${user.username}`;
          document.getElementById('email').innerText = `Email: ${user.email}`;
          document.getElementById('bio').innerText = `Bio: ${user.bio}`;
        } else {
          alert('Error loading profile');
          window.location.href = 'login.html';
        }

        fetchEvents();
        fetchWorkouts();
        
    });
    //profile backend 
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
    
  function selectProfilePic(src) {
    document.querySelectorAll('.picture-photo img').forEach(img => {
        img.classList.remove('selected');
    });

    // Add 'selected' class to the clicked image
    const selectedImage = document.querySelector(`.picture-photo img[src="${src}"]`);
    selectedImage.classList.add('selected');

    // Update profile photo
    document.getElementById('profile-photo').src = src;

    // Optionally, send the new profile picture to the server
    fetch('/api/updateProfilePicture', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ profilePicture: src })
    })
    .then(response => {
        if (response.ok) {
            console.log('Profile picture updated successfully');
        } else {
            alert('Error updating profile picture');
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
}


  const eventData = [];
  let currentSlide = 0;

  window.addEvent = function() {
    const eventInput = document.getElementById('event-input');
    const event = eventInput.value.trim();
    if (event) {
      eventData.push(event);
      renderEvents();
      eventInput.value = '';
    }
  };

  
  window.deleteEvent = function(index) {
    eventData.splice(index, 1);
    renderEvents();
  };

  
  function renderEvents() {
    const eventsSlider = document.getElementById('events-slider');
    eventsSlider.innerHTML = '';
    eventData.forEach((event, index) => {
      const div = document.createElement('div');
      div.classList.add('event-item');
      div.innerHTML = `
        ${event} <button onclick="deleteEvent(${index})">Delete</button>
      `;
      eventsSlider.appendChild(div);
    });
  }

  
  window.prevSlide = function() {
    if (currentSlide > 0) {
      currentSlide--;
      updateSliderPosition();
    }
  };

  window.nextSlide = function() {
    if (currentSlide < eventData.length - 1) {
      currentSlide++;
      updateSliderPosition();
    }
  };

  
  function updateSliderPosition() {
    const eventsSlider = document.getElementById('events-slider');
    const eventItems = document.querySelectorAll('.event-item');
    const itemWidth = eventItems[0].offsetWidth + 16; // Including margin
    eventsSlider.scrollLeft = currentSlide * itemWidth;
  }

  const form = document.getElementById('workout-form');
  const workoutList = document.getElementById('workout-list');
  
  if (form) {
    // Fetch and display saved workouts
    fetchWorkouts();
  
    form.addEventListener('submit', (event) => {
      event.preventDefault();
  
      const workout = {
        name: document.getElementById('name').value,
        date: document.getElementById('date').value,
        location: document.getElementById('location').value,
        description: document.getElementById('description').value
      };
  
      saveWorkout(workout);
      fetchWorkouts();
      form.reset();
    });
  
    function saveWorkout(workout) {
      let workouts = JSON.parse(localStorage.getItem('workouts')) || [];
      workouts.push(workout);
      localStorage.setItem('workouts', JSON.stringify(workouts));
    }
  }
 
function fetchWorkouts() {
  const token = localStorage.getItem('token');
  fetch('/api/workouts', {
      headers: { 'Authorization': token }
  })
  .then(response => response.json())
  .then(workouts => {
      workoutList.innerHTML = '';
      workouts.forEach(workout => {
          workoutList.innerHTML += `
              <div class="workout-item">
                  <h3>${workout.name}</h3>
                  <p>Date: ${new Date(workout.date).toLocaleDateString()}</p>
                  <p>Location: ${workout.location}</p>
                  <p>Description: ${workout.description}</p>
              </div>
          `;
      });
  });
}