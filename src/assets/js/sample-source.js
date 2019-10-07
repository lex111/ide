/**
 * Created by abhishek on 15/06/17.
 */
'use strict';

/**
 * Created by umair on 27/12/16.
 */

const c_sample =
  '#include <stdio.h>\n' +
  'int main() {\n' +
  '    printf("Hello World!");\n' +
  '}\n';

const cpp_sample =
  '#include <iostream>\n' +
  'using namespace std;\n' +
  'int main() {\n' +
  '    cout<<"Hello World!";\n' +
  '}\n';

const csharp_sample =
  'using System;\n' +
  'namespace HelloWorld\n' +
  '{\n' +
  '    class Hello\n' +
  '    {\n' +
  '        static void Main()\n' +
  '        {\n' +
  '            Console.WriteLine("Hello World!");\n' +
  '        }\n' +
  '    }\n' +
  '}\n';

const java_sample =
  'public class Main {\n' +
  '    public static void main(String args[]) {\n' +
  '        System.out.println("Hello World!");\n' +
  '    }\n' +
  '}';

const py2_sample =
  'print("Hello World!")';

const py3_sample =
  'print("Hello World!")';

const js_sample =
  `/*
    Use INPUT variable to get stdin.
    Try console.log(INPUT);
*/
    console.log('Hello World');`;

const ruby_sample = 'puts "Hello World!";'

const lang_samples = {
  'C': c_sample,
  'C++': cpp_sample,
  'C#': csharp_sample,
  'Java': java_sample,
  'Python': py2_sample,
  'Python 3': py3_sample,
  'JavaScript': js_sample,
  'Node.js': js_sample,
  'Ruby': ruby_sample
};

export default lang_samples

