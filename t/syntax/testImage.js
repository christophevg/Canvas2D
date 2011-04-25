{
  name   : "minimal image",
  data   : "sheet mySheet { image myImage1; }",
  result : "sheet mySheet {\n  image myImage1;\n}\n"
},
{
  name   : "src property",
  data   : "sheet mySheet { image myImage1 +src=\"test.png\"; }",
  result : "sheet mySheet {\n  image myImage1 +src=\"test.png\";\n}\n"
}
