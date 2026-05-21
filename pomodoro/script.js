const task=[];
let time=0;
let timer= null;

//tiempo de descanso
let timerBreak= null;
//tarea actual
let current=0;

//referencias del DOM
const bAdd=document.querySelector('#bAdd');
const itTask=document.querySelector('#itTask');
const form=document.querySelector('#form');
const taskName =document.querySelector('#time #taskName');

renderTime();
renderTask();

//eventos

form.addEventListener('submit', e=>{
    e.preventDefault();
    if (itTask.value !==''){
        createTask(itTask.value);
        itTask.value='';
        renderTask();
    }
      
    });

function createTask(value){
    const newTask={
        //id dinamico
        id: (Math.random()*100).toString(36).slice(3),
        title:value,
        completed:false
    };

    //agrega los elementos al array y devuelve la longitud
    task.unshift(newTask);
   
    };
//renderizar tareas en la interfaz
function renderTask(){
    const html= task.map(task=>{
        return `
        <div class="task">
            <div class="completed">${task.completed ? `<span class="done">Done</span>`: `<button class="start-button" data-id="${task.id}">Comenzar</button>`}</div>
            <div class="title">${task.title}</div>
        </div>
        `
    })

    const tasksContainer=document.querySelector('#tasks');
    //une los elementos de un array y los devuelve como cadena de texto
    tasksContainer.innerHTML=html.join('');


    const startButtons=document.querySelectorAll('.task .start-button');

    startButtons.forEach(button=>{
        button.addEventListener('click', e=>{
            if (!timer){
                const id=button.getAttribute('data-id');
                startButtonHandler(id);
                button.textContent='En progreso...';
            }
        });
     });
    }

function startButtonHandler(id){
    time=25*60;
    current=id;
    const taskIndex=task.findIndex(t=>t.id===id);

    taskName.textContent=task[taskIndex].title;
  //cuenta regresiva
    renderTime();
    timer=setInterval(()=>{
        timeHandler(id);
    },1000);
}

function timeHandler(id){
    time--;
    renderTime();

    if (time===0){
        clearInterval(timer);
        markCompleted(id);
        timer=null;
        sonarAlarma();
        renderTask();
            //tiempo de descanso
        startBreak();
    }
}



function renderTime(){
    const timeDiv=document.querySelector('#time #value');
    const minutes=parseInt(time/60);
    const seconds=parseInt(time%60);
    timeDiv.textContent=`${minutes < 10 ? "0" :""}${minutes}:${seconds < 10 ? "0" :""}${seconds}`;
}



function markCompleted(id){
    const taskIndex=task.findIndex(t=>t.id===id);
    task[taskIndex].completed=true;
}

function startBreak(){

    time=5*60;
    taskName.textContent='Break';
    renderTime();
    timerBreak=setInterval(()=>{
        timerBreakHandler();
    },1000);
}

function timerBreakHandler(){
    time--;
    renderTime();

    if (time===0){
        clearInterval(timerBreak);
        sonarAlarma();
        current=null;
        timerBreak=null;
        taskName.textContent='';
        renderTask();

    }
}


//funcion para sonar la alarma cuando acabe le tiempo, al finalizar el tiempo de trabajo y luego al finalizar el tiempo de descanso.

function sonarAlarma() {
  
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    
    // 2. Crear los nodos del oscilador (sonido) y de ganancia (volumen)
    const oscilador = audioCtx.createOscillator();
    const ganancia = audioCtx.createGain();
    
    // 3. Configurar el tipo de onda y la frecuencia (tono de campana/bip)
    oscilador.type = 'sine'; // Onda senoidal para un sonido limpio
    oscilador.frequency.setValueAtTime(880, audioCtx.currentTime); // Nota La5 (aguda)
    
    // 4. Configurar el volumen para que disminuya suavemente (efecto campana)
    ganancia.gain.setValueAtTime(0.5, audioCtx.currentTime);
    ganancia.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1.0); // Dura 1 segundo
    
    // 5. Conectar los nodos y reproducir
    oscilador.connect(ganancia);
    ganancia.connect(audioCtx.destination);
    
    oscilador.start();
    oscilador.stop(audioCtx.currentTime + 1.0); // Se detiene en 1 segundo
}
