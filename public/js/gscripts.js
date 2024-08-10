const { response } = require("express");

/*
  
  fetch('/user/123')
    .then(response => response.json())
    .then(user =>{
      document.getElementById('profile-photo').src= user.profilePhoto || 'deault-profilr.png';
      document.getElementById('profile-name').textContent ='${user.firstName} ${user.lastName}';
      document.getElementById('profile-bio').textContent = user.bio || 'No bio available'
    });*/
  
   
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
    });
    
    function selectProfilePic(src){
        document.querySelectorAll('.picture-gallery img').forEach(img =>{
          img.classList.remove('selected');
        });
    
      const selectedImage = document.querySelector('.picture-gallery img[src="${src}"]');
      selectedImage.classList.add('selected');
    
      // updating the profile picture in server
      fetch('/updatedProfilePricture',{
        method: 'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({profliePicture:src})
      }).then(response => {
          if(response.ok){
            document.getElementById('profile-photo').src=src;
          }else{
            alert('Error updating profile picture');
          }
      });
    }

  
  const workoutData = [];
  const eventData = [];
  let currentSlide = 0;


  window.addWorkout = function() {
    const workoutInput = document.getElementById('workout-input');
    const workout = workoutInput.value.trim();
    if (workout) {
      workoutData.push(workout);
      renderWorkouts();
      workoutInput.value = '';
    }
  };

  
  window.deleteWorkout = function(index) {
    workoutData.splice(index, 1);
    renderWorkouts();
  };

  
  function renderWorkouts() {
    const workoutList = document.getElementById('workout-list');
    workoutList.innerHTML = '';
    workoutData.forEach((workout, index) => {
      const li = document.createElement('li');
      li.innerHTML = `
        ${workout} <button onclick="deleteWorkout(${index})">Delete</button>
      `;
      workoutList.appendChild(li);
    });
  }

  
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
