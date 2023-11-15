将 Vim 打造成轻量级的 IDE
====================================================

介绍
~~~~~~~~~~~~~~~~~

在 Linux 系统中，Vim 编辑器常被用来编辑文件。Vim 可以提供缓冲区(buffers)、宏(macros) 和书签(bookmarking)的功能。Vim 还内置了一种自己的脚本语言，以便开发人员编写插件增强它的功能。下面我们就通过安装插件和增加配置的方式，来把基础的 Vim 变成一个轻量级的 IDE。

步骤
~~~~~~~~~~~~~~~~~

安装 Vundle 插件，用来管理插件
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

我们下面要安装很多插件，而这些插件可以用别的插件来管理，这个管理插件的插件就是 `Vundle`_ ，以下是命令步骤。

.. _Vundle: https://github.com/VundleVim/Vundle.vim

.. code:: shell

    $ mkdir -p ~/.vim/bundle
    $ cd ~/.vim/bundle
    $ git clone https://github.com/VundleVim/Vundle.vim.git Vundle.vim

然后把这写配置代码添加到 ``~/.vimrc`` 中：

.. note:: 注意，在 .vimrc 文件中， ``"`` 开头的是注释。 

.. code:: vim
   
   set nocompatible
   filetype off
   " 将运行时路径设置为包含 Vundle 并初始化
   set rtp+=~/.vim/bundle/Vundle.vim
   " 设置插件下载目录为 ~/.vim/plugged/
   call vundle#begin('~/.vim/plugged')
   " 让 Vundle 管理 Vundle
   Plugin 'VundleVim/Vundle.vim'
   call vundle#end()
   filetype plugin indent on

后面在安装新的插件的时候，就把 Plugin ``xxx/xxx.vim`` 添加到 ``call vundle#begin()`` 和 ``call vundle#end()`` 中间即可。
添加了插件后，需要手动触发安装所有插件。进入 vim 后，输入以下命令即可自动下载安装所有插件：

.. code:: vim

   :PluginInstall

输入命令后按 ``Enter`` 后，屏幕会从中间分成两边，并且显示安装过程。当在 vim 底部的状态栏中显示 ``Done`` 后，插件就全部安装好了，此时按 ``q`` 退出。
如果要卸载某个插件，只要将插件注释掉，然后执行这条命令即可：

.. code:: vim

   :PluginClean

这样那个插件的代码就会从插件目录被删除掉。

编辑 ``.vimrc`` 文件，在里面输入一些配置，让 vim 更好用。

.. code:: vim

   set number " 显示行号
   syntax on  " 开启代码语法高亮

当开启语法高亮后，vim 会从 ``syntax/<language>.vim`` 中寻找对应后缀文件的高亮文件。比如打开了 main.cpp，vim 会自动寻找 syntax.cpp 文件，并按照里面的规则进行代码文件的渲染。

配置 TAB 键、搜索、内置终端
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

下面添加几个和 Tab 键有关的配置：

.. code:: vim

   set tabstop=4 " 输入 \t 制表符后空 4 个空格 
   set shiftwidth=4 " 按下 Tab 后空 4 个空格
   set expandtab " 按下 Tab 后使用空格而不是制表符

在 Normal 模式下输入正斜杠时，会触发 vim 的搜索功能。下面这俩配置可以使搜索功能更加直观：

.. code:: vim

   set incsearch  " 启用增量搜索
   set hlsearch   " 搜索结果高亮显示

在搜索时，关键词会高亮显示，取消高亮输入： ``:noh`` 。


当输入 ``:term`` 时，会打开 vim 内置的终端，下面配置这个终端的一些特性：

.. code:: vim

   set termwinsize=12x0   " 设置终端尺寸为 12 行
   set splitbelow         " 始终在底部拆分
   set mouse=a            " 支持鼠标拖动窗口改变终端高度


增加各种编程语言语法包和缩进，vim-polyglot 插件
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

`vim-polyglot`_  插件可以对 50 多种编程语言进行语法高亮。通过下面的命令安装这个插件：

.. _vim-polyglot: https://github.com/sheerun/vim-polyglot

.. code:: shell

   # 在 .vimrc 中添加这行配置
   Plugin 'sheerun/vim-polyglot'
     # 通过这条命令在命令行安装插件
   $ vim +PluginInstall +qall

因为语言包是按需加载的，所以不会拖慢 vim 的启动和运行速度。可以用下面的命令查看语言包占用的空间：

.. code:: shell

   $ du -hcs ~/.vim/plugged/vim-polyglot
 
   # Output
   23M .vim/plugged/vim-polyglot/
   23M total

安装配色主题
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

虽然 Vim 的默认主题已经够用了，但我们也可以自己另外安装主题。输入 ``:color<space>`` ，然后按 ``<TAB>`` 键自动按顺序遍历出所有主题名称。

`awesome-vim-colorschemes`_ 这个仓库包含了许多好看的主题，可以从里面找自己喜欢的。添加下面的配置，并且执行安装，就可以安装对应主题了。

.. _awesome-vim-colorschemes: https://github.com/rafi/awesome-vim-colorschemes


.. note:: ``:color<space>`` 中的 ``<space>`` 代表空格。


.. code:: vim

   Plugin 'cocopon/iceberg.vim'
   Plugin 'arcticicestudio/nord-vim'
   Plugin 'Badacadabra/vim-archery'
   Plugin 'kristijanhusak/vim-hybrid-material'
   Plugin 'scheakur/vim-scheakur'
   Plugin 'lifepillar/vim-solarized'
     # Install on command line
   $ vim +PluginInstall +qall

可以随便打开一个文件预览一下这些主题样式，选择好某一个主题后，可以设置默认的主题。

.. code:: vim

   set background=dark   " 设置默认主题为深色主题
   colorscheme scheakur  " 设置默认主题的名称
   
方括号、圆括号和引号的自动成对补全，auto-pairs 插件
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

在输入括号、反引号、单双引号时可以让编辑器自动成对输入，通过安装 ``auto-pairs`` 插件可以实现：

.. code:: vim

   Plugin 'jiangmiao/auto-pairs'
     # Install on command line
   $ vim +PluginInstall +qall

这个自动补全的功能有时需要有时不需要。可以添加一个快捷键开关，让我们临时调节。

.. code:: vim

   let g:AutoPairsShortcutToggle = '<C-P>'

添加这条配置后，按 `CTRL P` 可以临时调节，编辑器是否自动成对输入那些字符。

文件管理器，NERDTree 插件
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

`NERDTree` 插件是一个文件资源管理器，可以在左侧打开一个边栏，以选择、浏览、重命名等等的当时管理文件。
安装配置如下：

.. code:: vim

   Plugin 'preservim/nerdtree'
     # Install on command line
   $ vim +PluginInstall +qall

在 ``vim`` 中，输入 ``:NERDTree`` 就可以打开这个文件资源管理器，输入 ``:help nerdtree`` 可以查看他的帮助文档。 
输入 ``q`` 或者 ``:NERDTreeClose`` 可以关闭它。 

下面再添加几个 NERDTree 的配置，让它更好用：

.. code:: vim

   let NERDTreeShowBookmarks = 1   " 显示书签表格
   let NERDTreeShowHidden = 1      " 显示隐藏文件
   let NERDTreeShowLineNumbers = 0 " 隐藏行号
   let NERDTreeMinimalMenu = 1     " 使用最小菜单(m)
   let NERDTreeWinPos = “left”     " 面板在左侧打开
   let NERDTreeWinSize = 31        " 设置面板宽度为31个字符

增加一个面板条，在里面展示源文件的标签，tagbar 插件
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

这个插件可以在文件管理器里面的当前打开的文件下面显示一横条，方便我们查看。

.. code:: vim

   Plugin 'preservim/tagbar'
     # Install on command line
   $ vim +PluginInstall +qall

参考文章
~~~~~~~~~~~~~~~~~

`How to Turn Vim Into a Lightweight IDE`_

.. _How to Turn Vim Into a Lightweight IDE: https://dane-bulat.medium.com/how-to-turn-vim-into-a-lightweight-ide-6185e0f47b79

