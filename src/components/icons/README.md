# Icons

## Purpose
This folder contains all the icons used throughout this application. 
Icons are taken from fontawesome.com
How to create Icon:
1. Go to fontawesome.com and create a free account.
2. When you find the icon you like click it.
3. In "HTML | REACT | VUE | SVG" choose "SVG"
4. Copy everything in d="..."
5. Create new jsx file
6. Paste d path in this format: 
```
import React from "react";

const IconName = ({className}) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512" ><path d="insert here d path"/></svg>
)

export default IconName;
```