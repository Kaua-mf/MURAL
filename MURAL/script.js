const API_URL = 'api.php';

document.addEventListener('DOMContentLoaded', () => {
 
    const recadoForm = document.getElementById('recado-form');
    const recadoIdInput = document.getElementById('recado-id');
    const recadoTituloInput = document.getElementById('recado-titulo');
    const recadoConteudoInput = document.getElementById('recado-conteudo');
    const saveButton = document.getElementById('save-button');
    const cancelButton = document.getElementById('cancel-button');
    const formTitle = document.getElementById('form-title');
    const postsList = document.getElementById('posts-list');
    const loadingIndicator = document.getElementById('loading-indicator');
    const deleteModalElement = document.getElementById('delete-modal');
    const deleteModal = new bootstrap.Modal(deleteModalElement);
    const modalConfirmDelete = document.getElementById('modal-confirm-delete');

    let recadoIdParaExcluir = null;

    const parseJSONResponse = async (response) => {
        const text = await response.text();
        try {
            return JSON.parse(text);
        } catch (e) {
            console.error("Erro Fatal do Servidor (Não é JSON):", text);
            throw new Error("O servidor retornou um erro. Abra o Console (F12) para ver os detalhes.");
        }
    };

    const setFormLoading = (isLoading) => {
        if (isLoading) {
            saveButton.classList.add('loading');
            saveButton.disabled = true;
            cancelButton.disabled = true;
            recadoTituloInput.disabled = true;
            recadoConteudoInput.disabled = true;
        } else {
            saveButton.classList.remove('loading');
            saveButton.disabled = false;
            cancelButton.disabled = false;
            recadoTituloInput.disabled = false;
            recadoConteudoInput.disabled = false;
        }
    };
    
    const setListLoading = (isLoading) => {
        loadingIndicator.style.display = isLoading ? 'flex' : 'none';
        postsList.querySelectorAll('button').forEach(btn => btn.disabled = isLoading);
    };

    const fetchRecados = async () => {
        setListLoading(true);
        try {
            const response = await fetch(API_URL, { method: 'GET' });
            const result = await parseJSONResponse(response);

            if (result.success && Array.isArray(result.data)) {
                renderRecados(result.data);
            } else {
                console.error('Falha ao buscar recados:', result.message);
                postsList.innerHTML = `<p class="text-danger col-12">Erro: ${result.message}</p>`;
            }
        } catch (error) {
            console.error('Erro fetchRecados:', error);
            postsList.innerHTML = `<p class="text-danger col-12">${error.message}</p>`;
        } finally {
            setListLoading(false);
        }
    };

    const handleSaveRecado = async (e) => {
        e.preventDefault(); 
        if (!recadoForm.checkValidity()) {
            e.stopPropagation();
            recadoForm.classList.add('was-validated');
            return;
        }
        recadoForm.classList.remove('was-validated');

        const id = recadoIdInput.value;
        const payload = {
            action: id !== '' ? 'update' : 'create',
            titulo: recadoTituloInput.value,
            conteudo: recadoConteudoInput.value
        };
        if (id !== '') payload.id = parseInt(id, 10);

        setFormLoading(true);
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const result = await parseJSONResponse(response);

            if (result.success) {
                resetForm();
                await fetchRecados();
            } else {
                throw new Error(result.message || 'Erro ao salvar recado.');
            }
        } catch (error) {
            alert(`Erro ao salvar: ${error.message}`);
        } finally {
            setFormLoading(false);
        }
    };

    const handleEditRecado = async (id) => {
        setListLoading(true);
        try {
            const response = await fetch(`${API_URL}?id=${id}`);
            const result = await parseJSONResponse(response);
            
            if (result.success) {
                try {
                    const data = JSON.parse(result.data.mensagem);
                    recadoIdInput.value = result.data.id;
                    recadoTituloInput.value = data.titulo;
                    recadoConteudoInput.value = data.conteudo;
                    formTitle.textContent = 'Editar Recado';
                    cancelButton.style.display = 'inline-block';
                    recadoForm.scrollIntoView({ behavior: 'smooth' });
                    recadoTituloInput.focus();
                } catch (parseError) {
                    alert("Erro ao processar dados do recado.");
                }
            } else {
                throw new Error(result.message);
            }
        } catch (error) {
            alert(`Erro ao carregar: ${error.message}`);
        } finally {
            setListLoading(false);
        }
    };

    const handleDeleteRecado = (id) => {
        recadoIdParaExcluir = id;
        deleteModal.show();
    };

    const confirmDelete = async () => {
        if (!recadoIdParaExcluir) return;
        setListLoading(true);
        deleteModal.hide();
        
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'delete', id: recadoIdParaExcluir })
            });

            const result = await parseJSONResponse(response);

            if (result.success) {
                await fetchRecados();
            } else {
                throw new Error(result.message || 'Erro ao excluir.');
            }
        } catch (error) {
            alert(`Erro ao excluir: ${error.message}`);
        } finally {
            recadoIdParaExcluir = null;
            // setListLoading(false) chamado por fetchRecados se sucesso, senão aqui:
             if (loadingIndicator.style.display === 'flex') setListLoading(false);
        }
    };

    const handleToggleFavorite = async (id) => {
        setListLoading(true);
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'toggleFavorite', id: id })
            });
            const result = await parseJSONResponse(response);
            if (result.success) {
                await fetchRecados();
            } else {
                throw new Error(result.message || 'Erro ao favoritar.');
            }
        } catch (error) {
            alert(`Erro ao favoritar: ${error.message}`);
            setListLoading(false);
        }
    };

    const renderRecados = (recados) => {
        postsList.innerHTML = '';
        if (recados.length === 0) {
            postsList.innerHTML = '<p class="text-muted col-12">Nenhum recado encontrado. Seja o primeiro a adicionar!</p>';
            return;
        }

        recados.forEach(recado => {
            let dataPost;
            try { dataPost = JSON.parse(recado.mensagem); } 
            catch (e) { dataPost = { titulo: "Erro", conteudo: recado.mensagem }; }

            const dataFormatada = new Date(recado.data_criacao).toLocaleString('pt-BR', {
                day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
            });
            const isFavorite = parseInt(recado.status, 10) === 1;

            const colWrapper = document.createElement('div');
            colWrapper.className = 'col-12 col-md-6 col-lg-4 mb-4';
            colWrapper.innerHTML = `
                <article class="card h-100 shadow-sm border-0 post-card ${isFavorite ? 'favorite' : ''}">
                    <div class="card-body d-flex flex-column">
                        <header class="mb-2"><h3 class="h5 card-title">${escapeHtml(dataPost.titulo)}</h3></header>
                        <p class="card-text flex-grow-1" style="white-space: pre-wrap;">${escapeHtml(dataPost.conteudo)}</p>
                        <footer class="mt-3">
                            <span class="card-subtitle text-muted d-block mb-3" style="font-size: 0.85rem;">Postado em: ${dataFormatada}</span>
                            <div class="d-flex justify-content-end gap-2">
                                <button class="btn btn-outline-warning btn-sm favorite-btn ${isFavorite ? 'active' : ''}" title="${isFavorite ? 'Remover Favorito' : 'Favoritar'}">
                                    <i class="bi ${isFavorite ? 'bi-star-fill' : 'bi-star'}"></i>
                                </button>
                                <button class="btn btn-outline-primary btn-sm edit-btn">Editar</button>
                                <button class="btn btn-outline-danger btn-sm delete-btn">Excluir</button>
                            </div>
                        </footer>
                    </div>
                </article>
            `;

            colWrapper.querySelector('.favorite-btn').addEventListener('click', () => handleToggleFavorite(recado.id));
            colWrapper.querySelector('.edit-btn').addEventListener('click', () => handleEditRecado(recado.id));
            colWrapper.querySelector('.delete-btn').addEventListener('click', () => handleDeleteRecado(recado.id));

            postsList.appendChild(colWrapper);
        });
    };

    const escapeHtml = (unsafe) => {
        return unsafe.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
    }

    const resetForm = () => {
        recadoForm.reset();
        recadoIdInput.value = '';
        formTitle.textContent = 'Adicionar Novo Recado';
        cancelButton.style.display = 'none';
        recadoForm.classList.remove('was-validated');
    };

    recadoForm.addEventListener('submit', handleSaveRecado);
    cancelButton.addEventListener('click', resetForm);
    modalConfirmDelete.addEventListener('click', confirmDelete);
    deleteModalElement.addEventListener('hidden.bs.modal', () => { recadoIdParaExcluir = null; });

    fetchRecados();
});