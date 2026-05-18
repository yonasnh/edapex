import{j as k,a as s}from"./jsx-runtime-8a1697f2.js";import{r}from"./index-8b3efc3f.js";import{c as d}from"./clsx-0839fdbe.js";import"./_commonjsHelpers-de833af9.js";const p=r.memo(({trigger:m,children:E,placement:_="bottom",open:c,onToggle:i,className:N})=>{const[x,P]=r.useState(!1),t=c!==void 0?c:x,l=r.useRef(null),o=e=>{c===void 0&&P(e),i==null||i(e)};return r.useEffect(()=>{if(!t)return;const e=u=>{if(u instanceof KeyboardEvent&&u.key==="Escape"){o(!1);return}l.current&&!l.current.contains(u.target)&&o(!1)};return document.addEventListener("mousedown",e),document.addEventListener("keydown",e),()=>{document.removeEventListener("mousedown",e),document.removeEventListener("keydown",e)}},[t]),k("div",{className:d("cm-popover-wrapper",N),ref:l,children:[s("div",{className:"cm-popover-trigger",onClick:()=>o(!t),role:"button",tabIndex:0,"aria-expanded":t,onKeyDown:e=>{(e.key==="Enter"||e.key===" ")&&(e.preventDefault(),o(!t))},children:m}),t&&s("div",{className:d("cm-popover",`cm-popover--${_}`),role:"tooltip",children:E})]})});p.displayName="Popover";try{p.displayName="Popover",p.__docgenInfo={description:"",displayName:"Popover",props:{trigger:{defaultValue:null,description:"",name:"trigger",required:!0,type:{name:"ReactNode"}},placement:{defaultValue:null,description:"",name:"placement",required:!1,type:{name:"enum",value:[{value:'"top"'},{value:'"bottom"'},{value:'"left"'},{value:'"right"'}]}},open:{defaultValue:null,description:"",name:"open",required:!1,type:{name:"boolean"}},onToggle:{defaultValue:null,description:"",name:"onToggle",required:!1,type:{name:"((open: boolean) => void)"}},className:{defaultValue:null,description:"",name:"className",required:!1,type:{name:"string"}}}}}catch{}const L={title:"Components/Popover",component:p,tags:["autodocs"]},n={args:{trigger:s("button",{type:"button",children:"Hover me"}),children:"Popover content",open:!0,placement:"bottom"}},a={args:{trigger:s("button",{type:"button",children:"Top popover"}),children:"Content above",open:!0,placement:"top"}};var v,f,g;n.parameters={...n.parameters,docs:{...(v=n.parameters)==null?void 0:v.docs,source:{originalSource:`{
  args: {
    trigger: <button type="button">Hover me</button>,
    children: 'Popover content',
    open: true,
    placement: 'bottom'
  }
}`,...(g=(f=n.parameters)==null?void 0:f.docs)==null?void 0:g.source}}};var b,y,h;a.parameters={...a.parameters,docs:{...(b=a.parameters)==null?void 0:b.docs,source:{originalSource:`{
  args: {
    trigger: <button type="button">Top popover</button>,
    children: 'Content above',
    open: true,
    placement: 'top'
  }
}`,...(h=(y=a.parameters)==null?void 0:y.docs)==null?void 0:h.source}}};const j=["Bottom","Top"];export{n as Bottom,a as Top,j as __namedExportsOrder,L as default};
