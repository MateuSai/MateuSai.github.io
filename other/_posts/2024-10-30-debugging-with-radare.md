---
tags: [Debugging]
references: [https://book.rada.re/debugger/intro.html]
---

Open and analyze program:

<!--more-->

{% highlight console %}
r2 -d -AAA <file/path>
WARN: Relocs has not been applied. Please use `-e bin.relocs.apply=true` or `-e bin.cache=true` next time
INFO: Analyze all flags starting with sym. and entry0 (aa)
INFO: Analyze imports (af@@@i)
INFO: Analyze entrypoint (af@ entry0)
INFO: Analyze symbols (af@@@s)
INFO: Analyze all functions arguments/locals (afva@@@F)
INFO: Analyze function calls (aac)
INFO: Analyze len bytes of instructions for references (aar)
INFO: Finding and parsing C++ vtables (avrr)
INFO: Analyzing methods (af @@ method.*)
INFO: Recovering local variables (afva@@@F)
INFO: Type matching analysis for all functions (aaft)
INFO: Propagate noreturn information (aanr)
INFO: Scanning for strings constructed in code (/azs)
INFO: Finding function preludes (aap)
INFO: Enable anal.types.constraint for experimental type propagation
INFO: Reanalizing graph references to adjust functions count (aarr)
INFO: Autoname all functions (.afna@@c:afla)
 -- Reduce the delta where flag resolving by address is used with cfg.delta
[0x7140ffb67290]>
{% endhighlight %}

## Adding breakpoints

Print function disassembly:

{% highlight console %}
[0x7140ffb67290]> pdf @ main
7            ;-- main:
            ; DATA XREF from sub.entry0_6040b8ec30a0 @ 0x6040b8ec30b8(r)
┌ 135: sub.main_6040b8ec3189 (int argc, char **argv);
│           ; arg int argc @ rdi
│           ; arg char **argv @ rsi
│           ; var int64_t var_8h @ rbp-0x8
│           ; var int64_t var_12h @ rbp-0x12
│           ; var int64_t var_24h @ rbp-0x24
│           ; var int64_t var_30h @ rbp-0x30
│           0x6040b8ec3189      f30f1efa       endbr64
│           0x6040b8ec318d      55             push rbp
│           0x6040b8ec318e      4889e5         mov rbp, rsp
│           0x6040b8ec3191      4883ec30       sub rsp, 0x30
│           0x6040b8ec3195      897ddc         mov dword [var_24h], edi ; argc
│           0x6040b8ec3198      488975d0       mov qword [var_30h], rsi ; argv
│           0x6040b8ec319c      64488b0425..   mov rax, qword fs:[0x28]
│           0x6040b8ec31a5      488945f8       mov qword [var_8h], rax
│           0x6040b8ec31a9      31c0           xor eax, eax
│           0x6040b8ec31ab      488d05520e..   lea rax, str.Enter_your_name: ; 0x6040b8ec4004 ; "Enter your name: "
│           0x6040b8ec31b2      4889c7         mov rdi, rax
│           0x6040b8ec31b5      b800000000     mov eax, 0
│           0x6040b8ec31ba      e8c1feffff     call sym.imp.printf     ; int printf(const char *format)
│           0x6040b8ec31bf      488d45ee       lea rax, [var_12h]
│           0x6040b8ec31c3      4889c6         mov rsi, rax
│           0x6040b8ec31c6      488d05490e..   lea rax, [0x6040b8ec4016] ; "%s"
│           0x6040b8ec31cd      4889c7         mov rdi, rax
│           0x6040b8ec31d0      b800000000     mov eax, 0
│           0x6040b8ec31d5      e8b6feffff     call sym.imp.__isoc99_scanf ; int scanf(const char *format)
│           0x6040b8ec31da      488d45ee       lea rax, [var_12h]
│           0x6040b8ec31de      4889c6         mov rsi, rax
│           0x6040b8ec31e1      488d05310e..   lea rax, str.Hi__s__n   ; 0x6040b8ec4019 ; "Hi %s!\n"
│           0x6040b8ec31e8      4889c7         mov rdi, rax
│           0x6040b8ec31eb      b800000000     mov eax, 0
│           0x6040b8ec31f0      e88bfeffff     call sym.imp.printf     ; int printf(const char *format)
│           0x6040b8ec31f5      b800000000     mov eax, 0
│           0x6040b8ec31fa      488b55f8       mov rdx, qword [var_8h]
│           0x6040b8ec31fe      64482b1425..   sub rdx, qword fs:[0x28]
│       ┌─< 0x6040b8ec3207      7405           je 0x6040b8ec320e
│       │   0x6040b8ec3209      e862feffff     call sym.imp.__stack_chk_fail ; void __stack_chk_fail(void)
│       └─> 0x6040b8ec320e      c9             leave
└           0x6040b8ec320f      c3             ret
{% endhighlight %}

Add breakpoint with `db <address>` and check the current breakpoints with `db`:

{% highlight console %}
[0x7140ffb67290]> db 0x6040b8ec31da
[0x7140ffb67290]> db
0x00000000 - 0x00000001 1 --x sw break enabled invalid cmd="" cond="" name="afl" module=""
0x6040b8ec31da - 0x6040b8ec31db 1 --x sw break enabled valid cmd="" cond="" name="0x6040b8ec31da" module="/home/mateus/path/to/file"
{% endhighlight %}

Use `dc` to run until the breakpoint:

{% highlight console %}
[0x7140ffb67290]> dc
Enter your name: Mateu
INFO: hit breakpoint at: 0x6040b8ec31da
{% endhighlight %}

## Check registers

We can check the state of the registers using `dr`:

{% highlight console %}
[0x6040b8ec31da]> dr
rax = 0x00000001
rbx = 0x00000000
rcx = 0x7140ffa1aaa0
rdx = 0x00000000
r8 = 0x00000000
r9 = 0x6040b95156b0
r10 = 0xffffffffffffff80
r11 = 0x00000000
r12 = 0x7ffc049e6408
r13 = 0x6040b8ec3189
r14 = 0x6040b8ec5db0
r15 = 0x7140ffb81040
rsi = 0x0000000a
rdi = 0x7ffc049e5d80
rsp = 0x7ffc049e62c0
rbp = 0x7ffc049e62f0
rip = 0x6040b8ec31da
rflags = 0x00000206
orax = 0xffffffffffffffff
[0x6040b8ec31da]>
{% endhighlight %}

<!-- ## References

- [https://book.rada.re/debugger/intro.html](https://book.rada.re/debugger/intro.html) -->