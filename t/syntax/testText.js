{
  name   : "minimal text",
  data   : "sheet mySheet { text myText1; }",
  result : "sheet mySheet {\n  text myText1;\n}\n"
},
{
  name   : "with text",
  data   : "sheet mySheet { text myText1 <= \"hello world\"; }",
  result : "sheet mySheet {\n  text myText1 <= \"hello world\";\n}\n"
},
{
  name   : "color property",
  data   : "sheet mySheet { text myText1 +color=\"rgba(1,2,3,0.5)\"; }",
  result : "sheet mySheet {\n  text myText1 +color=\"rgba(1,2,3,0.5)\";\n}\n"
},
{
  name   : "font property",
  data   : "sheet mySheet { text myText1 +font=\"10pt Arial\"; }",
  result : "sheet mySheet {\n  text myText1 +font=\"10pt Arial\";\n}\n"
},
{
  name   : "textAlign property",
  data   : "sheet mySheet { text myText1 +textAlign=\"center\"; }",
  result : "sheet mySheet {\n  text myText1 +textAlign=\"center\";\n}\n"
},
{
  name   : "textDecoration property",
  data   : "sheet mySheet { text myText1 +textDecoration=\"underline\"; }",
  result : "sheet mySheet {\n  text myText1 +textDecoration=\"underline\";\n}\n"
}
