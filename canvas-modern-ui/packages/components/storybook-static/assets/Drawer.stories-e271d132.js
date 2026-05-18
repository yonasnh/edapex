import{a as e,j as l}from"./jsx-runtime-8a1697f2.js";import{r as a}from"./index-8b3efc3f.js";import{c as E}from"./clsx-0839fdbe.js";import"./_commonjsHelpers-de833af9.js";const d=a.memo(({isOpen:r,onClose:t,side:b="right",title:c,children:_,width:D=360,className:x})=>{const u=a.useRef(null);return a.useEffect(()=>{r?u.current=document.activeElement:u.current&&u.current.focus()},[r]),a.useEffect(()=>{if(!r)return;const n=N=>{N.key==="Escape"&&t()};return document.addEventListener("keydown",n),()=>document.removeEventListener("keydown",n)},[r,t]),r?e("div",{className:"cm-drawer-overlay",onClick:t,role:"presentation",children:l("div",{className:E("cm-drawer",`cm-drawer--${b}`,x),style:{width:D},onClick:n=>n.stopPropagation(),role:"dialog","aria-modal":"true","aria-label":c||"Drawer",children:[l("div",{className:"cm-drawer__header",children:[c&&e("h2",{className:"cm-drawer__title",children:c}),e("button",{className:"cm-drawer__close",onClick:t,"aria-label":"Close drawer",type:"button",children:"✕"})]}),e("div",{className:"cm-drawer__body",children:_})]})}):null});d.displayName="Drawer";try{d.displayName="Drawer",d.__docgenInfo={description:"",displayName:"Drawer",props:{isOpen:{defaultValue:null,description:"",name:"isOpen",required:!0,type:{name:"boolean"}},onClose:{defaultValue:null,description:"",name:"onClose",required:!0,type:{name:"() => void"}},side:{defaultValue:null,description:"",name:"side",required:!1,type:{name:"enum",value:[{value:'"left"'},{value:'"right"'}]}},title:{defaultValue:null,description:"",name:"title",required:!1,type:{name:"string"}},width:{defaultValue:null,description:"",name:"width",required:!1,type:{name:"number"}},className:{defaultValue:null,description:"",name:"className",required:!1,type:{name:"string"}}}}}catch{}const O={title:"Components/Drawer",component:d,tags:["autodocs"]},s={args:{isOpen:!0,onClose:()=>{},title:"Drawer Title",children:"Drawer content goes here.",side:"right"}},i={args:{isOpen:!0,onClose:()=>{},title:"Left Drawer",children:"Content on the left side.",side:"left"}},o={args:{isOpen:!0,onClose:()=>{},title:"Course Details",children:l("div",{style:{display:"flex",flexDirection:"column",gap:16},children:[e("p",{children:"Course information and settings can be edited here."}),l("div",{style:{display:"flex",gap:8},children:[e("button",{type:"button",children:"Save"}),e("button",{type:"button",children:"Cancel"})]})]})}};var m,p,f;s.parameters={...s.parameters,docs:{...(m=s.parameters)==null?void 0:m.docs,source:{originalSource:`{
  args: {
    isOpen: true,
    onClose: () => {},
    title: 'Drawer Title',
    children: 'Drawer content goes here.',
    side: 'right'
  }
}`,...(f=(p=s.parameters)==null?void 0:p.docs)==null?void 0:f.source}}};var h,g,y;i.parameters={...i.parameters,docs:{...(h=i.parameters)==null?void 0:h.docs,source:{originalSource:`{
  args: {
    isOpen: true,
    onClose: () => {},
    title: 'Left Drawer',
    children: 'Content on the left side.',
    side: 'left'
  }
}`,...(y=(g=i.parameters)==null?void 0:g.docs)==null?void 0:y.source}}};var w,v,C;o.parameters={...o.parameters,docs:{...(w=o.parameters)==null?void 0:w.docs,source:{originalSource:`{
  args: {
    isOpen: true,
    onClose: () => {},
    title: 'Course Details',
    children: <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: 16
    }}>
        <p>Course information and settings can be edited here.</p>
        <div style={{
        display: 'flex',
        gap: 8
      }}>
          <button type="button">Save</button>
          <button type="button">Cancel</button>
        </div>
      </div>
  }
}`,...(C=(v=o.parameters)==null?void 0:v.docs)==null?void 0:C.source}}};const S=["Right","Left","WithContent"];export{i as Left,s as Right,o as WithContent,S as __namedExportsOrder,O as default};
