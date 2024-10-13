document.getElementById("csvFile").addEventListener("change", function (event) {
    const file = event.target.files[0];
    const reader = new FileReader();
    
    reader.onload = function (e) {
        const text = e.target.result;
        const data = parseCSV(text);
        createOrgChart(data);
    };
    
    reader.readAsText(file);
});

// Function to parse CSV data
function parseCSV(text) {
    const rows = text.split('\n').slice(1); // Skip header
    const nodes = rows.map(row => {
        const [id, name, managerId] = row.split(',');
        return { id, name, managerId };
    });
    return nodes;
}

// Function to create the org chart
function createOrgChart(data) {
    const root = { id: "root", children: [] };
    
    const map = new Map();
    data.forEach(({ id, name, managerId }) => {
        const node = { id, name, children: [] };
        map.set(id, node);
        
        if (managerId) {
            const manager = map.get(managerId);
            if (manager) {
                manager.children.push(node);
            } else {
                root.children.push(node); // Top-level nodes with no manager
            }
        } else {
            root.children.push(node); // Root node (no managerId)
        }
    });

    // Render the chart
    renderChart(root);
}

// Function to render the org chart
function renderChart(data) {
    d3.select("#orgChart").selectAll("*").remove(); // Clear previous chart

    const width = 600;
    const height = 400;
    const svg = d3.select("#orgChart")
        .append("svg")
        .attr("width", width)
        .attr("height", height);
    
    const treeLayout = d3.tree().size([height, width - 200]);
    const root = d3.hierarchy(data);
    treeLayout(root);

    svg.selectAll(".link")
        .data(root.links())
        .enter()
        .append("line")
        .attr("class", "link")
        .attr("x1", d => d.source.y)
        .attr("y1", d => d.source.x)
        .attr("x2", d => d.target.y)
        .attr("y2", d => d.target.x);

    const nodes = svg.selectAll(".node")
        .data(root.descendants())
        .enter()
        .append("g")
        .attr("class", "node")
        .attr("transform", d => `translate(${d.y},${d.x})`);

    nodes.append("circle")
        .attr("r", 5)
        .attr("fill", "#007BFF");

    nodes.append("text")
        .attr("dy", 3)
        .attr("x", d => d.children ? -8 : 8)
        .style("text-anchor", d => d.children ? "end" : "start")
        .text(d => d.data.name);
}
