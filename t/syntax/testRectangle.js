{
	name   : "minimal rectangle",
	data   : "sheet mySheet { rectangle myRect1; }",
	result : "sheet mySheet {\n  rectangle myRect1;\n}\n"
},
{
	name   : "box alias",
	data   : "sheet mySheet { box myRect1; }",
	result : "sheet mySheet {\n  rectangle myRect1;\n}\n"
},
{
	name   : "lineWidth property",
	data   : "sheet mySheet { rectangle myRect1 +lineWidth=5; }",
	result : "sheet mySheet {\n  rectangle myRect1 +lineWidth=5;\n}\n"
},
{
	name   : "lineColor property",
	data   : "sheet mySheet { rectangle myRect1 +lineColor=\"red\"; }",
	result : "sheet mySheet {\n  rectangle myRect1 +lineColor=\"red\";\n}\n"
},
{
	name   : "fillColor property",
	data   : "sheet mySheet { rectangle myRect1 +fillColor=\"green\"; }",
	result : "sheet mySheet {\n  rectangle myRect1 +fillColor=\"green\";\n}\n"
},
{
	name   : "roundCorners property",
	data   : "sheet mySheet { rectangle myRect1 +roundCorners=true; }",
	result : "sheet mySheet {\n  rectangle myRect1 +roundCorners=true;\n}\n"
},
{
	name   : "roundCorners property (negative)",
	data   : "sheet mySheet { rectangle myRect1 +roundCorners=false; }",
	result : "sheet mySheet {\n  rectangle myRect1;\n}\n"
}

