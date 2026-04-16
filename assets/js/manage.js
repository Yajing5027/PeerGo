(function(){
    let activeStatus = 'in-progress';
    let activeType = 'all';
    let activeRole = 'all';

    function byId(id){ return document.getElementById(id); }

    function readQueryStatus(){
        try {
            const status = new URLSearchParams(window.location.search).get('status') || '';
            if (status === 'completed' || status === 'cancelled' || status === 'in-progress') {
                return status;
            }
        } catch (e) {}
        return 'in-progress';
    }

    function getCounts(allRows){
        const counts = window.TaskListComponent && window.TaskListComponent.getStatusCounts
            ? window.TaskListComponent.getStatusCounts(allRows)
            : {
                inProgress: allRows.filter(function(r){ return r.bucket === 'in-progress'; }).length,
                completed: allRows.filter(function(r){ return r.bucket === 'completed'; }).length,
                cancelled: allRows.filter(function(r){ return r.bucket === 'cancelled'; }).length
            };
        return counts;
    }

    function renderStatusSummary(counts){
        var host = byId('manage-status-summary');
        if (!host) return;
        if (window.StatusSummaryComponent && window.StatusSummaryComponent.render) {
            window.StatusSummaryComponent.render(host, {
                mode: 'tab',
                counts: counts,
                activeStatus: activeStatus
            });
            return;
        }
    }

    function render(){
        const root = byId('unified-task-list');
        if (!root || !window.TaskListComponent) return;
        const user = window.TaskListComponent.getUser();
        const rows = window.TaskListComponent.getRowsForUser(user);
        const counts = getCounts(rows);
        renderStatusSummary(counts);

        const filtered = rows.filter(function(row){
            const statusMatch = row.bucket === activeStatus;
            const typeMatch = activeType === 'all' || row.kind === activeType;
            const roleMatch = activeRole === 'all' || row.role === activeRole;
            return statusMatch && typeMatch && roleMatch;
        });

        window.TaskListComponent.renderRows(root, filtered);
    }

    function bind(){
        var summaryHost = byId('manage-status-summary');
        if (summaryHost) {
            summaryHost.addEventListener('click', function(event){
                var btn = event.target.closest('.task-status-tab');
                if (!btn) return;
                activeStatus = btn.getAttribute('data-status') || 'in-progress';
                render();
            });
        }

        const typeSelect = byId('task-type-filter');
        if (typeSelect) {
            typeSelect.addEventListener('change', function(){
                activeType = typeSelect.value || 'all';
                render();
            });
        }

        const roleSelect = byId('task-role-filter');
        if (roleSelect) {
            roleSelect.addEventListener('change', function(){
                activeRole = roleSelect.value || 'all';
                render();
            });
        }

        document.addEventListener('mavside:ordersUpdated', render);
        window.addEventListener('storage', function(e){
            if (!e || !e.key) return;
            if (e.key === 'mavsideOrders' || e.key === 'mavsideDeliveryPosts') render();
        });
    }

    document.addEventListener('DOMContentLoaded', function(){
        activeStatus = readQueryStatus();
        bind();
        render();
    });
})();
