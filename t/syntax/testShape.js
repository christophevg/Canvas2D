{
  name  : "minimal shape",
  data  : "sheet mySheet { shape myShape1; }",
  result: "sheet mySheet {\n  shape myShape1;\n}\n"
},
{
  name  : "width property",
  data  : "sheet mySheet { shape myShape1 +width=10; }",
  result: "sheet mySheet {\n  shape myShape1 +width=10;\n}\n"
},
{
  name  : "height property",
  data  : "sheet mySheet { shape myShape1 +height=15; }",
  result: "sheet mySheet {\n  shape myShape1 +height=15;\n}\n"
},
{
  name  : "width + height property",
  data  : "sheet mySheet { shape myShape1 +width=10 +height=15; }",
  result: "sheet mySheet {\n  shape myShape1 +geo=\"10x15\";\n}\n"
},
{
  name  : "geo property",
  data  : "sheet mySheet { shape myShape1 +geo=\"10x15\"; }",
  result: "sheet mySheet {\n  shape myShape1 +geo=\"10x15\";\n}\n"
}
