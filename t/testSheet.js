{ 
	name     : "minimal sheet",
	data     : "Sheet mySheet;",
	result   : "sheet mySheet;\n",
},
{
	name     : "static style as key",
	data     : "+static Sheet mySheet;",
	result   : "sheet mySheet;\n",
},
{
	name     : "dynamic style as key",
	data     : "+dynamic Sheet mySheet;",
	result   : "sheet mySheet +dynamic;\n",
},
{
	name     : "full static style",
	data     : "+style=\"static\" Sheet mySheet;",
	result   : "sheet mySheet;\n",
},
{
	name     : "full dynamic style",
	data     : "+style=\"dynamic\" Sheet mySheet;",
	result   : "sheet mySheet +dynamic;\n",
},
{
	name     : "with one child construct",
	data     : "Sheet mySheet { Rectangle myRect1; }",
	result   : "sheet mySheet {\n  rectangle myRect1;\n}\n",
},
{
	name     : "with multiple child constructs",
	data     : "Sheet mySheet { Rectangle myRect1; Rectangle myRect2; }",
	result   : "sheet mySheet {\n  rectangle myRect1;\n  rectangle myRect2;\n}\n",
}