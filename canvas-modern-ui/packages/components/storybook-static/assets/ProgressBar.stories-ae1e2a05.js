import{j as d,a}from"./jsx-runtime-8a1697f2.js";import{r as A}from"./index-8b3efc3f.js";import{c as m}from"./clsx-0839fdbe.js";import"./_commonjsHelpers-de833af9.js";const e=A.memo(({value:c=0,max:p=100,variant:$="default",size:k="md",label:E,showLabel:C=!1,indeterminate:r=!1,className:O})=>{const g=Math.min(Math.max(c/p*100,0),100);return d("div",{className:m("cm-progress",`cm-progress--${k}`,O),role:"progressbar","aria-valuenow":r?void 0:c,"aria-valuemin":0,"aria-valuemax":p,"aria-label":E||"Progress",children:[a("div",{className:m("cm-progress__track",r&&"cm-progress__track--indeterminate"),children:a("div",{className:m("cm-progress__fill",`cm-progress__fill--${$}`,r&&"cm-progress__fill--indeterminate"),style:r?void 0:{width:`${g}%`}})}),C&&!r&&d("span",{className:"cm-progress__label",children:[Math.round(g),"%"]})]})});e.displayName="ProgressBar";try{e.displayName="ProgressBar",e.__docgenInfo={description:"",displayName:"ProgressBar",props:{value:{defaultValue:null,description:"",name:"value",required:!1,type:{name:"number"}},max:{defaultValue:null,description:"",name:"max",required:!1,type:{name:"number"}},variant:{defaultValue:null,description:"",name:"variant",required:!1,type:{name:"enum",value:[{value:'"default"'},{value:'"success"'},{value:'"warning"'},{value:'"danger"'}]}},size:{defaultValue:null,description:"",name:"size",required:!1,type:{name:"enum",value:[{value:'"sm"'},{value:'"md"'}]}},label:{defaultValue:null,description:"",name:"label",required:!1,type:{name:"string"}},showLabel:{defaultValue:null,description:"",name:"showLabel",required:!1,type:{name:"boolean"}},indeterminate:{defaultValue:null,description:"",name:"indeterminate",required:!1,type:{name:"boolean"}},className:{defaultValue:null,description:"",name:"className",required:!1,type:{name:"string"}}}}}catch{}const K={title:"Components/ProgressBar",component:e,tags:["autodocs"]},s={args:{value:45,showLabel:!0}},n={args:{value:80,variant:"success",showLabel:!0}},l={args:{value:55,variant:"warning",showLabel:!0}},t={args:{value:25,variant:"danger",showLabel:!0}},o={args:{indeterminate:!0}},u={args:{value:60,size:"sm"}},i={render:()=>d("div",{style:{display:"flex",flexDirection:"column",gap:12,maxWidth:400},children:[a(e,{value:90,variant:"success",showLabel:!0}),a(e,{value:50,variant:"warning",showLabel:!0}),a(e,{value:20,variant:"danger",showLabel:!0}),a(e,{value:60,showLabel:!0})]})};var v,f,h;s.parameters={...s.parameters,docs:{...(v=s.parameters)==null?void 0:v.docs,source:{originalSource:`{
  args: {
    value: 45,
    showLabel: true
  }
}`,...(h=(f=s.parameters)==null?void 0:f.docs)==null?void 0:h.source}}};var b,w,_;n.parameters={...n.parameters,docs:{...(b=n.parameters)==null?void 0:b.docs,source:{originalSource:`{
  args: {
    value: 80,
    variant: 'success',
    showLabel: true
  }
}`,...(_=(w=n.parameters)==null?void 0:w.docs)==null?void 0:_.source}}};var y,L,x;l.parameters={...l.parameters,docs:{...(y=l.parameters)==null?void 0:y.docs,source:{originalSource:`{
  args: {
    value: 55,
    variant: 'warning',
    showLabel: true
  }
}`,...(x=(L=l.parameters)==null?void 0:L.docs)==null?void 0:x.source}}};var S,P,V;t.parameters={...t.parameters,docs:{...(S=t.parameters)==null?void 0:S.docs,source:{originalSource:`{
  args: {
    value: 25,
    variant: 'danger',
    showLabel: true
  }
}`,...(V=(P=t.parameters)==null?void 0:P.docs)==null?void 0:V.source}}};var B,N,q;o.parameters={...o.parameters,docs:{...(B=o.parameters)==null?void 0:B.docs,source:{originalSource:`{
  args: {
    indeterminate: true
  }
}`,...(q=(N=o.parameters)==null?void 0:N.docs)==null?void 0:q.source}}};var D,z,W;u.parameters={...u.parameters,docs:{...(D=u.parameters)==null?void 0:D.docs,source:{originalSource:`{
  args: {
    value: 60,
    size: 'sm'
  }
}`,...(W=(z=u.parameters)==null?void 0:z.docs)==null?void 0:W.source}}};var j,I,M;i.parameters={...i.parameters,docs:{...(j=i.parameters)==null?void 0:j.docs,source:{originalSource:`{
  render: () => <div style={{
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    maxWidth: 400
  }}>
      <ProgressBar value={90} variant="success" showLabel />
      <ProgressBar value={50} variant="warning" showLabel />
      <ProgressBar value={20} variant="danger" showLabel />
      <ProgressBar value={60} showLabel />
    </div>
}`,...(M=(I=i.parameters)==null?void 0:I.docs)==null?void 0:M.source}}};const Q=["Default","Success","Warning","Danger","Indeterminate","Small","Variants"];export{t as Danger,s as Default,o as Indeterminate,u as Small,n as Success,i as Variants,l as Warning,Q as __namedExportsOrder,K as default};
