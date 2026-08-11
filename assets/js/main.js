

/**
 * MZ WX & Climate - JavaScript Principal
 */

// Atualiza o footer com a data atual
document.addEventListener('DOMContentLoaded', function() {
    const footerUpdate = document.getElementById('footer-update');
    if (footerUpdate) {
        footerUpdate.textContent = new Date().toLocaleString('pt-PT');
    }
    
    // Destaca o link ativo no menu
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.main-nav a');
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href && currentPath.includes(href) && href !== '../index.html' && href !== 'index.html') {
            link.classList.add('active');
        }
    });
});

/**
 * Função para carregar dados dinamicamente (exemplo)
 */
function loadData(url, callback) {
    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Erro ao carregar dados');
            }
            return response.json();
        })
        .then(data => callback(data))
        .catch(error => console.error('Erro:', error));
}



