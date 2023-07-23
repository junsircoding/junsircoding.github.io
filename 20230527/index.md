# 用 Plotly Python 绘制 Heatmap，自定义不等距 Colorbar


{{< figure src="/img/20230527/20230527_avatar.png" title="文章封面, 由作者通过 Canva 网站制作" >}}

### 用 Matplotlib 绘制 pcolormesh 填色图

Matplotlib 的 [`pcolormesh`](https://matplotlib.org/stable/api/_as_gen/matplotlib.pyplot.pcolormesh.html#matplotlib.pyplot.pcolormesh) 可以将二维数据绘制成填色图，可以一目了然地展示数据的分布情况。官方文档的 [`Demo`](https://matplotlib.org/stable/gallery/images_contours_and_fields/pcolormesh_levels.html#sphx-glr-gallery-images-contours-and-fields-pcolormesh-levels-py) 展示了这个函数的简单使用方式。

```python
import matplotlib.pyplot as plt
import numpy as np

np.random.seed(19680801) # 设置随机数种子, 保证每次生成的 Z 数据都相同
Z = np.random.rand(6, 10) # 二维网格数据, shape 为 (6x10)
x = np.arange(0, 11, 1)  # 长度为 11 的 x 轴坐标
y = np.arange(0, 7, 1)  # 长度为 7 的 y 轴坐标

fig = plt.figure(figsize=(16, 9)) # 创建画布
ax = fig.add_subplot(111)
img = ax.pcolormesh(x, y, Z, cmap="jet") # 添加填色实例, 设置色标
ax.set_xticks(x) # 设置 x 轴坐标
ax.set_yticks(y) # 设置 y 轴坐标
fig.colorbar(img, ax=ax) # 添加色带
fig.savefig("00_test.png", bbox_inches='tight') # 执行绘图并导出成图片
```

生成的 `Z` 数据如下，形状为 6 行 10 列：

|    |         0 |        1 |        2 |        3 |        4 |        5 |        6 |        7 |         8 |        9 |
|---:|----------:|---------:|---------:|---------:|---------:|---------:|---------:|---------:|----------:|---------:|
|  0 | 0.700367  | 0.742751 | 0.70928  | 0.566746 | 0.977785 | 0.706335 | 0.247916 | 0.157883 | 0.697699  | 0.719957 |
|  1 | 0.257744  | 0.341547 | 0.968761 | 0.694507 | 0.466383 | 0.702813 | 0.511786 | 0.928741 | 0.739769  | 0.622439 |
|  2 | 0.651545  | 0.396808 | 0.543239 | 0.7999   | 0.721545 | 0.295364 | 0.160946 | 0.206126 | 0.134325  | 0.480605 |
|  3 | 0.342522  | 0.362969 | 0.972918 | 0.110944 | 0.388264 | 0.783066 | 0.972897 | 0.48321  | 0.336421  | 0.567419 |
|  4 | 0.0479415 | 0.388937 | 0.906304 | 0.161018 | 0.743621 | 0.632974 | 0.32418  | 0.922377 | 0.237226  | 0.823946 |
|  5 | 0.750607  | 0.113784 | 0.845361 | 0.923932 | 0.220837 | 0.933054 | 0.488999 | 0.474719 | 0.0891675 | 0.229948 |

绘制出的图片如下：

{{< figure src="/img/20230527/20230527_00.png" title="Matplotlib pcolormesh Demo" >}}

从这张图中，结合右边的 `Colorbar` 我们可以清晰地看到数据的分布情况。

目前的 `Colorbar` 是像彩虹一样的渐变形式，色值分层也是默认的连续数值。我们可以做下面的修改，自定义色值分层，自定义每个区间的颜色，让 `Colorbar` 显示成「一格一格」的形式。

```python
import matplotlib.pyplot as plt
import numpy as np
from matplotlib.colors import BoundaryNorm, ListedColormap # 新增

np.random.seed(19680801) # 设置随机数种子, 保证每次生成的 Z 数据都相同
Z = np.random.rand(6, 10) # 二维网格数据, shape 为 (6x10)
x = np.arange(0, 11, 1)  # 长度为 11 的 x 轴坐标
y = np.arange(0, 7, 1)  # 长度为 7 的 y 轴坐标

fig = plt.figure(figsize=(16, 9)) # 创建画布
ax = fig.add_subplot(111)

# 修改---
# 自定义色值 LEVEL
LEVEL = [0., 0.1, 0.3, 0.4, 0.8, 0.85, 0.9]
# 自定义每个区间的颜色
cmap = ListedColormap([ '#01A0F6', '#00ECEC', '#00D800', '#019000', '#FFFF00', '#E7C000', ])  # type: ignore
norm = BoundaryNorm(LEVEL, ncolors=cmap.N, clip=True)
img = ax.pcolormesh(x, y, Z, cmap=cmap, norm=norm) # 添加填色实例
ax.set_xticks(x) # 设置 x 轴坐标
ax.set_yticks(y) # 设置 y 轴坐标
fig.colorbar(img, ax=ax, ticks=LEVEL) # 添加色带
# ---

fig.savefig("01_test.png", dpi=200, bbox_inches='tight') # 执行绘图并导出成图片
```

{{< figure src="/img/20230527/20230527_01.png" title="Matplotlib pcolormesh 自定义 colorbar" >}}

可以看到，我们设置的 `LEVEL` 并不是连续的数值，但每个色块显示的长度都是相同的。由此我们可以很灵活地根据业务需要去调整 `Colorbar`，画出我们想要的图。

### 用 Plotly 绘制 Heatmap 填色图

Matplotlib 画出的图都是静态的图片，如果我们想实时看到图中每个方格里的实际值是多少，该怎么做呢？

有很多库可以绘制交互式的图表，既可以生成 HTML 网页，也可以实时在 Jupyter Notebook 中展示，本文介绍 [`Plotly`](https://plotly.com/python/) 的使用。


与 pcolormesh 效果对应的就是 Heatmap，上文中的第一个 Demo 实现出来是这种效果：

{{< plotly json="/plotly/20230527/20230527_02.json" height="500px" modebar="false" >}}

绘图代码如下：

```python
import plotly.graph_objects as go
import numpy as np
np.random.seed(1)

np.random.seed(19680801) # 设置随机数种子, 保证每次生成的 Z 数据都相同
Z = np.random.rand(6, 10) # 二维网格数据, shape 为 (6x10)
x = np.arange(0, 11, 1)  # 长度为 11 的 x 轴坐标
y = np.arange(0, 7, 1)  # 长度为 7 的 y 轴坐标

fig = go.Figure(data=go.Heatmap(
        z=Z,
        x=x,
        y=y,
        colorscale='jet'
    )
)

fig.update_layout(
    title='Plotly Heatmap Demo',
    xaxis=dict(tickvals=x, ticktext=x, title="X Axis"),
    yaxis=dict(tickvals=y, ticktext=y, title="Y Axis"),
)

fig.write_json("02_test.html")
```

这便是 Plotly 画出的交互图，把鼠标放上去可以看到每个方格的具体数值，并且可以自由放大、缩小，以及将图表保存成图片下载等等。

可以注意到这个图的 Colorbar 也是连续的彩虹状，而这个图要自定义 `LEVEL` 就不像 Matplotlib 那样简单了，两个库的实现思路完全不同。

这里给出实现的代码：

```python
import plotly.graph_objects as go
import numpy as np
import pandas as pd


def trans_data(level: list, colors: list):
    """转换数据
    
    Args:
        level(list): 自定义层级列表
        colors(list): 自定义颜色列表, 长度应比 level 小 1

    Returns:
        (tuple):
            分组转换后的数据
            区间值列表
            色标分层列表
    """
    assert len(colors) + 1 == len(level), "colors 长度应比 level 小 1"

    labels = np.arange(len(LEVEL)+1)
    ratio_list = np.linspace(0, 1, len(color_list)+1).tolist()

    colorscale_list = [[ratio_list[0], color_list[0]]]
    for idx, _ in enumerate(color_list[1:]):
        colorscale_list.append([ratio_list[idx+1], color_list[idx]])
        colorscale_list.append([ratio_list[idx+1], color_list[idx+1]])
    colorscale_list.append([ratio_list[-1], color_list[-1]])

    Z_cut = pd.DataFrame(pd.cut(
        Z.flatten(),
        bins=[-np.infty] + LEVEL + [np.infty],
        labels=labels
    ).reshape(Z.shape))
    return Z_cut, labels, colorscale_list


np.random.seed(19680801)  # 设置随机数种子, 保证每次生成的 Z 数据都相同
Z = np.random.rand(6, 10)  # 二维网格数据, shape 为 (6x10)
x = np.arange(0, 11, 1)  # 长度为 11 的 x 轴坐标
y = np.arange(0, 7, 1)  # 长度为 7 的 y 轴坐标

LEVEL = [0., 0.1, 0.3, 0.4, 0.8, 0.85, 0.9]
color_list = ['#01A0F6', '#00ECEC', '#00D800', '#019000', '#FFFF00', '#E7C000']

Z_cut, labels, colorscale_list = trans_data(LEVEL, color_list)
Z_cut_values = np.unique(Z_cut.values.flatten())

fig = go.Figure(data=go.Heatmap(
    z=Z_cut,
    x=x,
    y=y,
    colorbar=dict(
        tickvals=np.arange(Z_cut_values.min(), Z_cut_values.max()+1),
        ticktext=LEVEL
    ),
    colorscale=colorscale_list,
    customdata=Z,
    hovertemplate='x: %{x}<br>y: %{y}<br>z:  %{customdata}<extra></extra>',
)
)

fig.update_layout(
    title='Plotly Heatmap Demo',
    xaxis=dict(tickvals=x, ticktext=x, title="X Axis"),
    yaxis=dict(tickvals=y, ticktext=y, title="Y Axis"),
)

fig.write_html("03_test.html")
```

图表效果是这样：

{{< plotly json="/plotly/20230527/20230527_03.json" height="500px" modebar="false" >}}


### 参考资料

[Including plotly figures in Hugo posts](https://ig248.gitlab.io/post/2018-11-05-plotly-sample/)
