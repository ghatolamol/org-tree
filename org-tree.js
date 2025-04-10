
class LazyOrgChart extends OrgChart {
    constructor() {
        super();
        const l = {
            loadChildren: () => Promise.resolve([]),
            hasChildren: () => false,
            afterUpdate: () => { /* nop */ },
        };
        this.getLazyLoadingAttrs = () => l;

        Object.keys(l).forEach((k) => {
            this[k] = function (t) { return t ? (l[k] = t, this) : l[k]; };
        });
    }

    addNodes(nodes) {
        for (const obj of nodes) {
            const attrs = this.getChartState();
            if (attrs.allNodes.some(({ data }) => attrs.nodeId(data) === attrs.nodeId(obj))) {
                console.log(`ORG CHART - ADD - Node with id "${attrs.nodeId(obj)}" already exists in tree`);
                return this;
            }
            if (!attrs.allNodes.some(({ data }) => attrs.nodeId(data) === attrs.parentNodeId(obj))) {
                console.log(`ORG CHART - ADD - Parent node with id "${attrs.parentNodeId(obj)}" not found in the tree`);
                return this;
            }
            if (obj._centered && !obj._expanded)
                obj._expanded = true;
            attrs.data.push(obj);
        }
        this.updateNodesState();
        return this;
    }

    onButtonClick(e, d) {
        const attrs = this.getLazyLoadingAttrs();
        if (!d.children && !d._children && attrs.hasChildren(d.data)) {
            attrs.loadChildren(d.data)
                .then(nodes => {
                    this.addNodes(nodes.map(node => {
                        node._expanded = true;
                        return node;
                    }));
                    super.onButtonClick(e, d);
                });
        } else {
            super.onButtonClick(e, d);
        }
    }

    update(params) {
        super.update(params);
        this.getLazyLoadingAttrs().afterUpdate?.();
        const container = select(this.getChartState().container).node();
        if (container)
            for (const node of container.querySelectorAll(".node-button-g")) {
                if (node.querySelector(".node-button-div")?.childElementCount) {
                    node.removeAttribute("display");
                    node.removeAttribute("opacity");
                }
            }
    }
}
