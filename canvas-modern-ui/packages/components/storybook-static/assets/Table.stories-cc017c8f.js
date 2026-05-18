import{a as r,j as f}from"./jsx-runtime-8a1697f2.js";import{r as m}from"./index-8b3efc3f.js";import{c as i}from"./clsx-0839fdbe.js";import{B as ee}from"./Atoms-67ed3676.js";import"./_commonjsHelpers-de833af9.js";function S({columns:a,data:l,rowKey:w,sortable:p=!1,stickyHeader:F=!1,onRowClick:b,selectedRows:s,onSelectedRowsChange:n,emptyState:L,loading:P=!1,density:V="default",className:x}){const[o,Q]=m.useState(null),[k,q]=m.useState("asc"),K=m.useCallback(e=>{o===e?q(t=>t==="asc"?"desc":"asc"):(Q(e),q("asc"))},[o]),U=m.useCallback(()=>{s&&n&&(s.size===l.length?n(new Set):n(new Set(l.map(w))))},[s,n,l,w]),X=m.useCallback(e=>{if(!s||!n)return;const t=new Set(s);t.has(e)?t.delete(e):t.add(e),n(t)},[s,n]),Y=o?[...l].sort((e,t)=>{const c=a.find(R=>R.id===o);if(!c)return 0;const d=c.accessor(e),Z=c.accessor(t),T=String(d).localeCompare(String(Z));return k==="asc"?T:-T}):l;return P?r("div",{className:i("cm-table",`cm-table--${V}`,x),"aria-busy":"true",children:r("div",{className:"cm-table__skeleton",children:Array.from({length:5}).map((e,t)=>r("div",{className:"cm-table__skeleton-row",style:{width:`${85+Math.random()*15}%`}},t))})}):l.length===0?r("div",{className:i("cm-table",x),children:L||r("div",{className:"cm-table__empty",children:r("p",{children:"No data available"})})}):r("div",{className:i("cm-table",`cm-table--${V}`,x),children:f("table",{className:i(F&&"cm-table--sticky"),children:[r("thead",{children:f("tr",{children:[s&&r("th",{className:"cm-table__cell cm-table__cell--checkbox",children:r("input",{type:"checkbox",checked:s.size===l.length&&l.length>0,onChange:U,"aria-label":"Select all rows"})}),a.map(e=>f("th",{className:i("cm-table__cell cm-table__cell--header",e.sortable&&p&&"cm-table__cell--sortable",e.align&&`cm-table__cell--${e.align}`),style:e.width?{width:e.width}:void 0,onClick:()=>{e.sortable&&p&&K(e.id)},"aria-sort":o===e.id?k==="asc"?"ascending":"descending":void 0,tabIndex:e.sortable&&p?0:void 0,onKeyDown:t=>{(t.key==="Enter"||t.key===" ")&&e.sortable&&p&&(t.preventDefault(),K(e.id))},children:[e.header,o===e.id&&r("span",{className:"cm-table__sort-icon","aria-hidden":"true",children:k==="asc"?" ↑":" ↓"})]},e.id))]})}),r("tbody",{children:Y.map(e=>{const t=w(e),c=s==null?void 0:s.has(t);return f("tr",{className:i("cm-table__row",c&&"cm-table__row--selected",b&&"cm-table__row--clickable"),onClick:()=>b==null?void 0:b(e),"aria-selected":c||void 0,children:[s&&r("td",{className:"cm-table__cell cm-table__cell--checkbox",children:r("input",{type:"checkbox",checked:c??!1,onChange:()=>X(t),"aria-label":`Select row ${t}`})}),a.map(d=>r("td",{className:i("cm-table__cell",d.align&&`cm-table__cell--${d.align}`),children:d.accessor(e)},d.id))]},t)})})]})})}S.displayName="Table";try{S.displayName="Table",S.__docgenInfo={description:"",displayName:"Table",props:{columns:{defaultValue:null,description:"",name:"columns",required:!0,type:{name:"Column<T>[]"}},data:{defaultValue:null,description:"",name:"data",required:!0,type:{name:"T[]"}},rowKey:{defaultValue:null,description:"",name:"rowKey",required:!0,type:{name:"(row: T) => string | number"}},sortable:{defaultValue:{value:"false"},description:"",name:"sortable",required:!1,type:{name:"boolean"}},stickyHeader:{defaultValue:{value:"false"},description:"",name:"stickyHeader",required:!1,type:{name:"boolean"}},onRowClick:{defaultValue:null,description:"",name:"onRowClick",required:!1,type:{name:"((row: T) => void)"}},selectedRows:{defaultValue:null,description:"",name:"selectedRows",required:!1,type:{name:"Set<string | number>"}},onSelectedRowsChange:{defaultValue:null,description:"",name:"onSelectedRowsChange",required:!1,type:{name:"((selected: Set<string | number>) => void)"}},emptyState:{defaultValue:null,description:"",name:"emptyState",required:!1,type:{name:"ReactNode"}},loading:{defaultValue:{value:"false"},description:"",name:"loading",required:!1,type:{name:"boolean"}},density:{defaultValue:{value:"default"},description:"",name:"density",required:!1,type:{name:"enum",value:[{value:'"default"'},{value:'"compact"'}]}},className:{defaultValue:null,description:"",name:"className",required:!1,type:{name:"string"}}}}}catch{}const ne={title:"Components/Table",component:S,tags:["autodocs"]},N=[{id:1,name:"Alice Johnson",email:"alice@example.com",grade:"A",status:"active"},{id:2,name:"Bob Smith",email:"bob@example.com",grade:"B+",status:"active"},{id:3,name:"Carol Davis",email:"carol@example.com",grade:"A-",status:"active"},{id:4,name:"David Wilson",email:"david@example.com",grade:"C",status:"inactive"},{id:5,name:"Eve Martinez",email:"eve@example.com",grade:"B",status:"active"}],u=[{id:"name",header:"Name",accessor:a=>a.name,sortable:!0},{id:"email",header:"Email",accessor:a=>a.email,sortable:!0},{id:"grade",header:"Grade",accessor:a=>r("strong",{children:a.grade}),sortable:!0},{id:"status",header:"Status",accessor:a=>r(ee,{variant:a.status==="active"?"success":"default",size:"sm",children:a.status})}],h={args:{columns:u,data:N,rowKey:a=>a.id}},y={args:{columns:u,data:N,rowKey:a=>a.id,sortable:!0}},g={args:{columns:u,data:N,rowKey:a=>a.id,sortable:!0,selectedRows:new Set([1,3])}},_={args:{columns:u,data:N,rowKey:a=>a.id,density:"compact"}},v={args:{columns:u,data:[],rowKey:a=>a.id,emptyState:r("div",{style:{padding:32,textAlign:"center",color:"#6B7280"},children:"No students found"})}};var C,D,A;h.parameters={...h.parameters,docs:{...(C=h.parameters)==null?void 0:C.docs,source:{originalSource:`{
  args: {
    columns,
    data,
    rowKey: (row: Student) => row.id
  }
}`,...(A=(D=h.parameters)==null?void 0:D.docs)==null?void 0:A.source}}};var B,E,$;y.parameters={...y.parameters,docs:{...(B=y.parameters)==null?void 0:B.docs,source:{originalSource:`{
  args: {
    columns,
    data,
    rowKey: (row: Student) => row.id,
    sortable: true
  }
}`,...($=(E=y.parameters)==null?void 0:E.docs)==null?void 0:$.source}}};var z,j,W;g.parameters={...g.parameters,docs:{...(z=g.parameters)==null?void 0:z.docs,source:{originalSource:`{
  args: {
    columns,
    data,
    rowKey: (row: Student) => row.id,
    sortable: true,
    selectedRows: new Set([1, 3])
  }
}`,...(W=(j=g.parameters)==null?void 0:j.docs)==null?void 0:W.source}}};var H,M,G;_.parameters={..._.parameters,docs:{...(H=_.parameters)==null?void 0:H.docs,source:{originalSource:`{
  args: {
    columns,
    data,
    rowKey: (row: Student) => row.id,
    density: 'compact'
  }
}`,...(G=(M=_.parameters)==null?void 0:M.docs)==null?void 0:G.source}}};var I,J,O;v.parameters={...v.parameters,docs:{...(I=v.parameters)==null?void 0:I.docs,source:{originalSource:`{
  args: {
    columns,
    data: [],
    rowKey: (row: Student) => row.id,
    emptyState: <div style={{
      padding: 32,
      textAlign: 'center',
      color: '#6B7280'
    }}>No students found</div>
  }
}`,...(O=(J=v.parameters)==null?void 0:J.docs)==null?void 0:O.source}}};const ce=["Default","Sortable","WithSelection","Compact","Empty"];export{_ as Compact,h as Default,v as Empty,y as Sortable,g as WithSelection,ce as __namedExportsOrder,ne as default};
