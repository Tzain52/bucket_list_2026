const API_BASE = '/api';

let currentItems = [];

document.addEventListener('DOMContentLoaded', () => {
    setupSplashScreen();
    setupCharCounters();
    setupFilePreview();
});

function setupSplashScreen() {
    const splashScreen = document.getElementById('splash-screen');
    const splashEnter = document.getElementById('splash-enter');
    const mainContent = document.getElementById('main-content');
    
    // Check if user has already seen splash screen in this session
    const hasSeenSplash = sessionStorage.getItem('hasSeenSplash');
    
    if (hasSeenSplash) {
        // Skip splash screen
        splashScreen.classList.add('hidden');
        mainContent.classList.add('visible');
        loadItems();
        loadStats();
    } else {
        // Show splash screen
        splashEnter.addEventListener('click', () => {
            // Mark as seen
            sessionStorage.setItem('hasSeenSplash', 'true');
            
            // Hide splash screen
            splashScreen.classList.add('hidden');
            
            // Show main content after a short delay
            setTimeout(() => {
                mainContent.classList.add('visible');
                loadItems();
                loadStats();
            }, 300);
        });
    }
    
    // Prevent body scroll when splash is visible
    if (!hasSeenSplash) {
        document.body.style.overflow = 'hidden';
        
        // Re-enable scroll when splash is hidden
        splashEnter.addEventListener('click', () => {
            setTimeout(() => {
                document.body.style.overflow = 'auto';
            }, 800);
        });
    }
}

function setupCharCounters() {
    const descInput = document.getElementById('description');
    const charCount = document.getElementById('char-count');
    
    if (descInput && charCount) {
        descInput.addEventListener('input', () => {
            charCount.textContent = `${descInput.value.length}/500`;
        });
    }
    
    const editDescInput = document.getElementById('edit-description');
    const editCharCount = document.getElementById('edit-char-count');
    
    if (editDescInput && editCharCount) {
        editDescInput.addEventListener('input', () => {
            editCharCount.textContent = `${editDescInput.value.length}/500`;
        });
    }
}

function setupFilePreview() {
    const fileInput = document.getElementById('photo-upload');
    const preview = document.getElementById('file-preview');
    
    if (fileInput && preview) {
        fileInput.addEventListener('change', (e) => {
            const files = e.target.files;
            if (files.length > 0) {
                preview.innerHTML = '';
                const previewGrid = document.createElement('div');
                previewGrid.style.display = 'grid';
                previewGrid.style.gridTemplateColumns = 'repeat(3, 1fr)';
                previewGrid.style.gap = '8px';
                previewGrid.style.marginTop = '12px';
                
                Array.from(files).slice(0, 6).forEach(file => {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        const img = document.createElement('img');
                        img.src = e.target.result;
                        img.style.width = '100%';
                        img.style.height = '80px';
                        img.style.objectFit = 'cover';
                        img.style.borderRadius = '8px';
                        previewGrid.appendChild(img);
                    };
                    reader.readAsDataURL(file);
                });
                
                if (files.length > 6) {
                    const more = document.createElement('div');
                    more.textContent = `+${files.length - 6} more`;
                    more.style.display = 'flex';
                    more.style.alignItems = 'center';
                    more.style.justifyContent = 'center';
                    more.style.background = 'var(--beige-medium)';
                    more.style.borderRadius = '8px';
                    more.style.fontWeight = '600';
                    more.style.color = 'var(--maroon-dark)';
                    previewGrid.appendChild(more);
                }
                
                preview.appendChild(previewGrid);
            }
        });
    }
}

function selectName(element, name) {
    document.querySelectorAll('#add-modal .name-option').forEach(opt => {
        opt.classList.remove('selected');
    });
    element.classList.add('selected');
    document.getElementById('added-by').value = name;
}

function selectEditName(element, name) {
    document.querySelectorAll('#edit-modal .name-option').forEach(opt => {
        opt.classList.remove('selected');
    });
    element.classList.add('selected');
    document.getElementById('edit-added-by').value = name;
}

async function loadItems() {
    try {
        const response = await fetch(`${API_BASE}/items`);
        const items = await response.json();
        currentItems = items;
        renderItems(items);
    } catch (error) {
        console.error('Error loading items:', error);
        showNotification('Failed to load items', 'error');
    }
}

async function loadStats() {
    try {
        const response = await fetch(`${API_BASE}/stats`);
        const stats = await response.json();
        updateStats(stats);
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

function updateStats(stats) {
    document.getElementById('total-count').textContent = stats.total;
    document.getElementById('pending-count').textContent = stats.pending;
    document.getElementById('completed-count').textContent = stats.completed;
    document.getElementById('completion-percentage').textContent = `${stats.completion_percentage}%`;
    
    const progressBar = document.getElementById('progress-bar');
    progressBar.style.width = `${stats.completion_percentage}%`;
}

function renderItems(items) {
    const grid = document.getElementById('items-grid');
    const emptyState = document.getElementById('empty-state');
    
    if (items.length === 0) {
        grid.innerHTML = '';
        emptyState.classList.add('show');
        return;
    }
    
    emptyState.classList.remove('show');
    
    grid.innerHTML = items.map(item => {
        const createdDate = new Date(item.created_at).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
        
        const completedDate = item.completed_at ? new Date(item.completed_at).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        }) : null;
        
        const maxPhotosToShow = 5;
        const photosHTML = item.photos && item.photos.length > 0 ? `
            <div class="item-photos">
                <div class="photos-grid">
                    ${item.photos.slice(0, maxPhotosToShow).map(photo => `
                        <div class="photo-item">
                            <img src="/${photo.photo_path}" alt="Memory" onclick="viewPhotos(${item.id})">
                            <button class="photo-delete-btn" onclick="deletePhoto(event, ${photo.id})" title="Delete photo">×</button>
                        </div>
                    `).join('')}
                    ${item.photos.length > maxPhotosToShow ? `
                        <div class="photo-item more-photos" onclick="viewPhotos(${item.id})">
                            +${item.photos.length - maxPhotosToShow} more
                        </div>
                    ` : ''}
                </div>
                ${item.photos.length > 0 ? `<div class="photo-count">📸 ${item.photos.length} photo${item.photos.length > 1 ? 's' : ''}</div>` : ''}
            </div>
        ` : '';
        
        return `
            <div class="item-card ${item.is_completed ? 'completed' : ''}" id="item-${item.id}">
                <div class="item-header">
                    <div class="checkbox-wrapper">
                        <input 
                            type="checkbox" 
                            class="checkbox" 
                            ${item.is_completed ? 'checked' : ''}
                            onchange="toggleComplete(${item.id}, this.checked, this)"
                        >
                    </div>
                    <span class="item-badge">${item.added_by}</span>
                </div>
                
                <div class="item-description">${escapeHtml(item.description)}</div>
                
                <div class="item-meta">
                    <span class="item-author">Added by ${item.added_by}</span>
                    <span class="item-date">${createdDate}</span>
                </div>
                
                ${item.is_completed && completedDate ? `
                    <div class="completion-badge">
                        ✨ Completed on ${completedDate}
                    </div>
                ` : ''}
                
                ${item.is_completed ? `
                    <div class="photo-upload-section" id="upload-section-${item.id}">
                        ${photosHTML}
                        <button class="btn-small btn-photo" onclick="openPhotoModal(${item.id})">
                            📸 ${item.photos && item.photos.length > 0 ? 'Add More Photos' : 'Add Photo'}
                        </button>
                    </div>
                ` : ''}
                
                <div class="item-actions">
                    <button class="btn-small btn-edit" onclick="openEditModal(${item.id})">
                        ✏️ Edit
                    </button>
                    <button class="btn-small btn-delete" onclick="deleteItem(${item.id})">
                        🗑️ Delete
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function openAddModal() {
    document.getElementById('add-modal').classList.add('show');
    document.getElementById('description').value = '';
    document.getElementById('added-by').value = '';
    document.getElementById('char-count').textContent = '0/500';
    document.querySelectorAll('#add-modal .name-option').forEach(opt => {
        opt.classList.remove('selected');
    });
}

function closeAddModal() {
    document.getElementById('add-modal').classList.remove('show');
}

async function addItem(event) {
    event.preventDefault();
    
    const submitBtn = event.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    
    submitBtn.disabled = true;
    submitBtn.textContent = 'Adding...';
    submitBtn.style.opacity = '0.6';
    submitBtn.style.cursor = 'not-allowed';
    
    const description = document.getElementById('description').value;
    const addedBy = document.getElementById('added-by').value;
    
    try {
        const response = await fetch(`${API_BASE}/items`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                description,
                added_by: addedBy
            })
        });
        
        if (response.ok) {
            closeAddModal();
            await loadItems();
            await loadStats();
            showNotification('Dream added successfully! ✨', 'success');
        } else {
            showNotification('Failed to add dream', 'error');
        }
    } catch (error) {
        console.error('Error adding item:', error);
        showNotification('Failed to add dream', 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
        submitBtn.style.opacity = '1';
        submitBtn.style.cursor = 'pointer';
    }
}

function openEditModal(itemId) {
    const item = currentItems.find(i => i.id === itemId);
    if (!item) return;
    
    document.getElementById('edit-item-id').value = item.id;
    document.getElementById('edit-description').value = item.description;
    document.getElementById('edit-added-by').value = item.added_by;
    document.getElementById('edit-char-count').textContent = `${item.description.length}/500`;
    
    document.querySelectorAll('#edit-modal .name-option').forEach(opt => {
        opt.classList.remove('selected');
        if (opt.textContent === item.added_by) {
            opt.classList.add('selected');
        }
    });
    
    document.getElementById('edit-modal').classList.add('show');
}

function closeEditModal() {
    document.getElementById('edit-modal').classList.remove('show');
}

async function updateItem(event) {
    event.preventDefault();
    
    const submitBtn = event.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    
    submitBtn.disabled = true;
    submitBtn.textContent = 'Saving...';
    submitBtn.style.opacity = '0.6';
    submitBtn.style.cursor = 'not-allowed';
    
    const itemId = document.getElementById('edit-item-id').value;
    const description = document.getElementById('edit-description').value;
    const addedBy = document.getElementById('edit-added-by').value;
    
    try {
        const response = await fetch(`${API_BASE}/items/${itemId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                description,
                added_by: addedBy
            })
        });
        
        if (response.ok) {
            closeEditModal();
            await loadItems();
            showNotification('Dream updated successfully! ✏️', 'success');
        } else {
            showNotification('Failed to update dream', 'error');
        }
    } catch (error) {
        console.error('Error updating item:', error);
        showNotification('Failed to update dream', 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
        submitBtn.style.opacity = '1';
        submitBtn.style.cursor = 'pointer';
    }
}

async function deleteItem(itemId) {
    if (!confirm('Are you sure you want to delete this dream?')) {
        return;
    }
    
    const deleteBtn = event.target;
    const originalText = deleteBtn.textContent;
    
    deleteBtn.disabled = true;
    deleteBtn.textContent = 'Deleting...';
    deleteBtn.style.opacity = '0.6';
    deleteBtn.style.cursor = 'not-allowed';
    
    try {
        const response = await fetch(`${API_BASE}/items/${itemId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            await loadItems();
            await loadStats();
            showNotification('Dream deleted', 'success');
        } else {
            showNotification('Failed to delete dream', 'error');
        }
    } catch (error) {
        console.error('Error deleting item:', error);
        showNotification('Failed to delete dream', 'error');
    } finally {
        deleteBtn.disabled = false;
        deleteBtn.textContent = originalText;
        deleteBtn.style.opacity = '1';
        deleteBtn.style.cursor = 'pointer';
    }
}

async function toggleComplete(itemId, isCompleted, checkbox) {
    const originalState = !isCompleted;
    
    checkbox.disabled = true;
    checkbox.style.opacity = '0.6';
    checkbox.style.cursor = 'not-allowed';
    
    try {
        const response = await fetch(`${API_BASE}/items/${itemId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                is_completed: isCompleted
            })
        });
        
        if (response.ok) {
            await loadItems();
            await loadStats();
            
            if (isCompleted) {
                showNotification('Dream completed! 🎉', 'success');
            } else {
                showNotification('Dream marked as pending', 'success');
            }
        } else {
            showNotification('Failed to update status', 'error');
            checkbox.checked = originalState;
            await loadItems();
        }
    } catch (error) {
        console.error('Error toggling complete:', error);
        showNotification('Failed to update status', 'error');
        checkbox.checked = originalState;
        await loadItems();
    } finally {
        checkbox.disabled = false;
        checkbox.style.opacity = '1';
        checkbox.style.cursor = 'pointer';
    }
}

function openPhotoModal(itemId) {
    document.getElementById('photo-item-id').value = itemId;
    document.getElementById('photo-upload').value = '';
    document.getElementById('file-preview').innerHTML = '';
    document.getElementById('photo-modal').classList.add('show');
}

function closePhotoModal() {
    document.getElementById('photo-modal').classList.remove('show');
}

async function uploadPhoto(event) {
    event.preventDefault();
    
    const submitBtn = event.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    
    const itemId = document.getElementById('photo-item-id').value;
    const fileInput = document.getElementById('photo-upload');
    const files = fileInput.files;
    
    if (files.length === 0) {
        showNotification('Please select at least one photo', 'error');
        return;
    }
    
    submitBtn.disabled = true;
    submitBtn.textContent = 'Uploading...';
    submitBtn.style.opacity = '0.6';
    submitBtn.style.cursor = 'not-allowed';
    
    try {
        let successCount = 0;
        let failCount = 0;
        
        for (let i = 0; i < files.length; i++) {
            const formData = new FormData();
            formData.append('photo', files[i]);
            
            submitBtn.textContent = `Uploading ${i + 1}/${files.length}...`;
            
            const response = await fetch(`${API_BASE}/items/${itemId}/photos`, {
                method: 'POST',
                body: formData
            });
            
            if (response.ok) {
                successCount++;
            } else {
                failCount++;
            }
        }
        
        closePhotoModal();
        await loadItems();
        
        if (failCount === 0) {
            showNotification(`${successCount} photo${successCount > 1 ? 's' : ''} uploaded successfully! 📸`, 'success');
        } else {
            showNotification(`${successCount} uploaded, ${failCount} failed`, 'error');
        }
    } catch (error) {
        console.error('Error uploading photos:', error);
        showNotification('Failed to upload photos', 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
        submitBtn.style.opacity = '1';
        submitBtn.style.cursor = 'pointer';
    }
}

async function deletePhoto(event, photoId) {
    event.stopPropagation();
    
    if (!confirm('Delete this photo?')) {
        return;
    }
    
    const deleteBtn = event.target;
    const originalText = deleteBtn.textContent;
    
    deleteBtn.disabled = true;
    deleteBtn.textContent = 'Deleting...';
    deleteBtn.style.opacity = '0.6';
    deleteBtn.style.cursor = 'not-allowed';
    
    try {
        const response = await fetch(`${API_BASE}/photos/${photoId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            await loadItems();
            showNotification('Photo deleted', 'success');
        } else {
            showNotification('Failed to delete photo', 'error');
        }
    } catch (error) {
        console.error('Error deleting photo:', error);
        showNotification('Failed to delete photo', 'error');
    } finally {
        deleteBtn.disabled = false;
        deleteBtn.textContent = originalText;
        deleteBtn.style.opacity = '1';
        deleteBtn.style.cursor = 'pointer';
    }
}

function viewPhotos(itemId) {
    const item = currentItems.find(i => i.id === itemId);
    if (!item || !item.photos || item.photos.length === 0) return;
    
    const gallery = document.getElementById('photo-gallery');
    gallery.innerHTML = item.photos.map(photo => `
        <div class="gallery-item">
            <img src="/${photo.photo_path}" alt="Memory">
            <div class="gallery-item-actions">
                <button class="btn-small btn-delete" onclick="deletePhoto(event, ${photo.id})">
                    🗑️ Delete
                </button>
            </div>
        </div>
    `).join('');
    
    document.getElementById('view-photo-modal').classList.add('show');
}

function closeViewPhotoModal() {
    document.getElementById('view-photo-modal').classList.remove('show');
}

function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideInRight 0.3s ease-out reverse';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

window.onclick = function(event) {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        if (event.target === modal) {
            modal.classList.remove('show');
        }
    });
}
