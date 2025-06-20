
  const pendingTbody = document.querySelector('#pendingTable tbody');
  const completedTbody = document.querySelector('#completedTable tbody');

  const nameInput = document.getElementById('nameInput');
  const serviceTypeSelect = document.getElementById('serviceType');
  const descInput = document.getElementById('descInput');
  const addBtn = document.getElementById('addBtn');

  const exportBtn = document.getElementById('exportBtn');
  const importBtn = document.getElementById('importBtn');
  const importFile = document.getElementById('importFile');

  let todos = { pending: [], completed: [] };
  let editRemarksId = null;

  // Load from localStorage
  function loadData() {
    const data = localStorage.getItem('todoData');
    if(data) {
      todos = JSON.parse(data);
      // sort pending by time
      todos.pending.sort((a,b) => new Date(a.time) - new Date(b.time));
      // sort completed by latest time
      todos.completed.sort((a,b) => new Date(b.time) - new Date(a.time));
    }
  }

  // Save to localStorage
  function saveData() {
    localStorage.setItem('todoData', JSON.stringify(todos));
  }

  // Render functions
  function render() {
    // Clear tables
    pendingTbody.innerHTML = '';
    completedTbody.innerHTML = '';

    // Pending tasks sorted by time ascending
    todos.pending.sort((a,b) => new Date(a.time) - new Date(b.time));
    todos.pending.forEach(task => addTaskRow(task, false));

    // Completed tasks sorted by latest time
    todos.completed.sort((a,b) => new Date(b.time) - new Date(a.time));
    todos.completed.forEach(task => addTaskRow(task, true));
  }

  function addTaskRow(task, isCompleted) {
    const tbodyRef = isCompleted ? completedTbody : pendingTbody;
    const tr = document.createElement('tr');

    // Name
    const nameTd = document.createElement('td');
    nameTd.textContent = task.name;
    tr.appendChild(nameTd);

    // Service Type
    const serviceTd = document.createElement('td');
    serviceTd.textContent = task.serviceType;
    tr.appendChild(serviceTd);

    // Description
    const descTd = document.createElement('td');
    descTd.textContent = task.description || '-';
    tr.appendChild(descTd);

    // Remarks or empty
    const remarksTd = document.createElement('td');
    remarksTd.textContent = task.remarks || '-';
    tr.appendChild(remarksTd);

    // Time
    const timeTd = document.createElement('td');
    timeTd.textContent = new Date(task.time).toLocaleString();
    tr.appendChild(timeTd);

    // Actions
    const actionsTd = document.createElement('td');

    if(!isCompleted) {
      // Complete button
      const completeBtn = document.createElement('button');
      completeBtn.title = 'Mark as Completed';
      completeBtn.className = 'material-icons';
      completeBtn.innerHTML = 'check_circle';
      completeBtn.onclick = () => completeTask(task.id);
      actionsTd.appendChild(completeBtn);

      // Edit remarks button
      const editBtn = document.createElement('button');
      editBtn.title = 'Edit Remarks';
      editBtn.className = 'material-icons';
      editBtn.innerHTML = 'edit';
      editBtn.onclick = () => openEditModal(task.id);
      actionsTd.appendChild(editBtn);

      // Remove button
      const removeBtn = document.createElement('button');
      removeBtn.title = 'Remove';
      removeBtn.className = 'material-icons';
      removeBtn.innerHTML = 'delete';
      removeBtn.onclick = () => removeTask(task.id);
      actionsTd.appendChild(removeBtn);
    } else {
      // For completed, only remove
      const removeBtn = document.createElement('button');
      removeBtn.title = 'Remove';
      removeBtn.className = 'material-icons';
      removeBtn.innerHTML = 'delete';
      removeBtn.onclick = () => removeTask(task.id);
      actionsTd.appendChild(removeBtn);
    }

    tr.appendChild(actionsTd);
    tbodyRef.appendChild(tr);
  }

  // Generate unique ID
  function generateId() {
    return Date.now() + Math.random().toString(36).substr(2, 5);
  }

  // Add task
  addBtn.onclick = () => {
    const name = nameInput.value.trim();
    const serviceType = serviceTypeSelect.value;
    let description = '';
    if(serviceType === 'Other') {
      description = descInput.value.trim();
      if(!description) {
        alert('Please enter description for Other service.');
        return;
      }
    }
    if(!name) {
      alert('Enter name.');
      return;
    }
    const id = generateId();
    const time = new Date().toISOString();

    const task = {
      id,
      name,
      serviceType,
      description,
      remarks: '',
      time,
    };
    todos.pending.push(task);
    saveData();
    render();
    // Clear inputs
    nameInput.value = '';
    descInput.value = '';
  };

  // Show/hide description input based on service type
  serviceTypeSelect.onchange = () => {
    if(serviceTypeSelect.value === 'Other') {
      descInput.style.display = 'block';
    } else {
      descInput.style.display = 'none';
      descInput.value = '';
    }
  };

  // Complete task
  function completeTask(id) {
    const index = todos.pending.findIndex(t => t.id === id);
    if(index > -1) {
      const task = todos.pending.splice(index,1)[0];
      task.completedTime = new Date().toISOString();
      todos.completed.push(task);
      saveData();
      render();
    }
  }

  // Remove task
  function removeTask(id) {
    let index = todos.pending.findIndex(t => t.id === id);
    if(index > -1) {
      todos.pending.splice(index,1);
    } else {
      index = todos.completed.findIndex(t => t.id === id);
      if(index > -1) {
        todos.completed.splice(index,1);
      }
    }
    saveData();
    render();
  }

  // Open edit modal for remarks
  function openEditModal(id) {
    editRemarksId = id;
    const task = todos.pending.find(t => t.id === id);
    if(!task) return;
    document.getElementById('remarksInput').value = task.remarks || '';
    document.getElementById('editModal').style.display = 'block';
  }

  // Save remarks
  document.getElementById('saveRemarks').onclick = () => {
    const remarks = document.getElementById('remarksInput').value.trim();
    const task = todos.pending.find(t => t.id === editRemarksId);
    if(task) {
      task.remarks = remarks;
      saveData();
      render();
    }
    document.getElementById('editModal').style.display = 'none';
  };

  // Cancel edit
  document.getElementById('cancelEdit').onclick = () => {
    document.getElementById('editModal').style.display = 'none';
  };

  // Export data
  document.getElementById('exportBtn').onclick = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(todos));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "todo_data.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  // Import data
  document.getElementById('importBtn').onclick = () => {
    document.getElementById('importFile').click();
  };
  document.getElementById('importFile').onchange = () => {
    const file = document.getElementById('importFile').files[0];
    if(file) {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const data = JSON.parse(reader.result);
          if(data && data.pending && data.completed) {
            todos = data;
            saveData();
            render();
            alert('Data imported successfully.');
          } else {
            alert('Invalid data format.');
          }
        } catch(e) {
          alert('Error parsing file.');
        }
      };
      reader.readAsText(file);
    }
  };

  // Initial load
  loadData();
  render();