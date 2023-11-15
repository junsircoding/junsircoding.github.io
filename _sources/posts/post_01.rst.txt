气象数据的各种插值问题
========================

到目前为止，我接触到的气象相关数据有 **等经纬度网格数据** 和 **站点数据**。

注：为叙述简便，**等经纬度网格数据** 以下简称 **网格数据** 。数据下载来源点击这里： `站点数据`_ （搜索 ``station`` ）， `网格数据`_ 。

.. _站点数据: https://cds.climate.copernicus.eu/#!/search?text=ERA5&type=dataset

.. _网格数据: https://cds.climate.copernicus.eu/#!/search?text=ERA5&type=dataset

--------------

**站点数据**\ 就是个二维数据表，一般是 CSV 或者其他文本格式，这里我使用
*test_station.csv*\  [1]_ 文件。

通常用
`Pandas <https://docs.xarray.dev/en/stable/getting-started-guide/quick-overview.html>`__
读取：

.. code:: python

   import pandas as pd

   df = pd.read_csv("test_station.csv", sep=",", encoding="utf-8", comment="#")
   print(df.columns)
   df = df[["latitude", "longitude", "total_column_water_vapour"]]
   df.columns = ["lat", "lon", "value"]
   print(df)

结构就像这样：

::

   Index(['report_id', 'station_name', 'city', 'organisation_name', 'latitude',
          'longitude', 'sensor_altitude', 'height_of_station_above_sea_level',
          'start_date', 'report_timestamp', 'total_column_water_vapour'],
         dtype='object')

               lat         lon  value
   0     49.186825  -68.263330  12.88
   1     51.192345   14.521734  30.69
   2     47.907738    7.632879  29.42
   3     48.380493   -4.496594  15.99
   4     50.798060    4.358563  19.01
   ...         ...         ...    ...
   9811  60.750510 -135.222100  14.09
   9812  52.236870 -122.167810  19.11
   9813  34.226120 -118.055916  13.35
   9814  62.481323 -114.480840  15.52
   9815  62.480892 -114.480705  15.57

   [9816 rows x 3 columns]

其中 ``lat`` 表示纬度，\ ``lon`` 表示经度，\ ``val`` 表示站点观测值。

这个数据用 `VSCode <https://code.visualstudio.com/>`__ 简单预览是这样：

.. figure:: /_images/20230529/00.png
   :alt: 站点数据预览

   站点数据预览

--------------

**网格数据**\ 通常用
`Xarray <https://docs.xarray.dev/en/stable/getting-started-guide/quick-overview.html>`__
读取，这里我使用 *test_grid.nc*\  [2]_：

.. code:: python

   import xarray as xr

   with xr.open_dataset("test_grid.nc") as ds_nc:
       ds_nc = ds_nc.rename({"latitude":"lat", "longitude":"lon"}) # 重命名维度名称
       dr_nc = ds_nc.isel(time=0)["t"] # 用索引的方式选取首个 time 维度, 选取变量 t
       print(dr_nc)

结构就像这样：

::

   <xarray.DataArray 't' (lat: 721, lon: 1440)>
   [1038240 values with dtype=float32]
   Coordinates:
     * lon      (lon) float32 0.0 0.25 0.5 0.75 1.0 ... 359.0 359.2 359.5 359.8
     * lat      (lat) float32 90.0 89.75 89.5 89.25 ... -89.25 -89.5 -89.75 -90.0
       time     datetime64[ns] 2020-07-01
   Attributes:
       units:          K
       long_name:      Temperature
       standard_name:  air_temperature

其中，\ ``lat`` 和 ``lon``
是这个数据的两个维度，即纬度和经度，\ ``Coordinates``
展示了这两个维度对应的坐标信息，\ ``Attributes`` 是一些属性信息，是个
Dict。

这个数据用
`Panoply <https://www.giss.nasa.gov/tools/panoply/download/>`__
简单预览是这样：

.. figure:: /_images/20230529/01.png
   :alt: 格点数据预览

   格点数据预览

--------------

在实际使用过程中，经常会有这样的需求：

-  将\ **网格数据**\ 插值到另一个坐标、分辨率不同的\ **网格数据**\ 上
-  将\ **网格数据**\ 插值到\ **站点数据**\ 上
-  将\ **站点数据**\ 插值到\ **网格数据**\ 上
-  …

下面逐一说明。

--------------

将网格数据插值到另一个坐标、分辨率不同的网格数据上
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

我们这里再读取一个与 *test_grid.nc* 坐标不同的一个 grib2
格式的网格数据，\ *test_grid.grib2*\  [3]_：

.. code:: python

   import xarray as xr

   with xr.open_dataset(
       "test_grid.grib2", engine="cfgrib", 
       backend_kwargs={
           "indexpath":"",
           'filter_by_keys':{
               'typeOfLevel':'surface',
               'shortName':'t',
               'level':0
           }
       }
   ) as ds_grib2:
       ds_grib2 = ds_grib2.rename({"latitude":"lat", "longitude":"lon"}) # 重命名维度名称
       dr_grib2 = ds_grib2["t"]
       print(dr_grib2)

结构就像这样：

::

   <xarray.DataArray 't' (lat: 181, lon: 360)>
   [65160 values with dtype=float32]
   Coordinates:
       time        datetime64[ns] ...
       step        timedelta64[ns] ...
       surface     float64 ...
     * lat         (lat) float64 90.0 89.0 88.0 87.0 ... -87.0 -88.0 -89.0 -90.0
     * lon         (lon) float64 0.0 1.0 2.0 3.0 4.0 ... 356.0 357.0 358.0 359.0
       valid_time  datetime64[ns] ...
   Attributes: (12/29)
       GRIB_paramId:                             130
       GRIB_dataType:                            fc
       GRIB_numberOfPoints:                      65160
       GRIB_typeOfLevel:                         surface
       GRIB_stepUnits:                           1
       GRIB_stepType:                            instant
       ...                                       ...
       GRIB_name:                                Temperature
       GRIB_shortName:                           t
       GRIB_units:                               K
       long_name:                                Temperature
       units:                                    K
       standard_name:                            air_temperature

用 Panoply 预览是这样：

.. figure:: /_images/20230529/02.png
   :alt: grib2 格式的格点数据预览

   grib2 格式的格点数据预览

可以看到 *test_grid.nc* 的经纬度坐标为
``(lon: 1440, lat: 721)``\ ，\ *test_grid.grib2* 的经纬度坐标为
``(lat: 181, lon: 360)``\ ，是不一样的。

如果我们想得到 *test_grid.nc* 在 *test_grid.grib2*
的坐标上对应的值，只要将前者插值到 *test_grid.grib2*
上就可以了，代码如下：

.. code:: python

   import xarray as xr

   with xr.open_dataset("test_grid.nc") as ds_nc:
       ds_nc = ds_nc.rename({"latitude":"lat", "longitude":"lon"}) # 重命名维度名称
       dr_nc = ds_nc.isel(time=0)["t"] # 用索引的方式选取首个 time 维度, 选取变量 t

   with xr.open_dataset(
       "test_grid.grib2", engine="cfgrib", 
       backend_kwargs={
           "indexpath":"",
           'filter_by_keys':{
               'typeOfLevel':'surface',
               'shortName':'t',
               'level':0
           }
       }
   ) as ds_grib2:
       ds_grib2 = ds_grib2.rename({"latitude":"lat", "longitude":"lon"}) # 重命名维度名称
       dr_grib2 = ds_grib2["t"]

   dr_nc_interp = dr_nc.interp(lat=dr_grib2.lat, lon=dr_grib2.lon) # 将 nc 插值到 grib2 的坐标上

   print(dr_nc_interp)
   dr_nc_interp.to_netcdf("test_grid_interp.nc") # 将插值后的数据导出成 nc

插值后的数据预览如下：

::

   <xarray.DataArray 't' (lat: 181, lon: 360)>
   array([[254.54649353, 254.54649353, 254.54649353, ..., 254.54649353,
           254.54649353, 254.54649353],
          [252.3180542 , 252.36672974, 252.41772461, ..., 252.17819214,
           252.2230072 , 252.2701416 ],
          [249.42973328, 249.46296692, 249.50082397, ..., 249.34706116,
           249.3717804 , 249.39805603],
          ...,
          [234.89929199, 234.8343811 , 234.77180481, ..., 235.0947876 ,
           235.02911377, 234.96342468],
          [235.33354187, 235.33818054, 235.34359741, ..., 235.31808472,
           235.32427979, 235.3289032 ],
          [235.04379272, 235.04379272, 235.04379272, ..., 235.04379272,
           235.04379272, 235.04379272]])
   Coordinates:
       time        datetime64[ns] 2020-07-01
     * lat         (lat) float64 90.0 89.0 88.0 87.0 ... -87.0 -88.0 -89.0 -90.0
     * lon         (lon) float64 0.0 1.0 2.0 3.0 4.0 ... 356.0 357.0 358.0 359.0
       step        timedelta64[ns] 00:00:00
       surface     float64 0.0
       valid_time  datetime64[ns] 2016-10-06
   Attributes:
       units:          K
       long_name:      Temperature
       standard_name:  air_temperature

用 Panoply 查看插值后的数据，可以看到数据分布和 *test_grid.nc*
是一样的，但是这两个数据的坐标是不一样的。

.. figure:: /_images/20230529/03.png
   :alt: nc 插值到 grib2 的格点数据预览

   nc 插值到 grib2 的格点数据预览

--------------

将网格数据插值到站点数据上
~~~~~~~~~~~~~~~~~~~~~~~~~~

将二维的站点数据转为三维的网格数据
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

这里我写了两种方式，一种是直接 for
循环填充数据，当数据量较大时速度很慢；一种是用 Pandas
的内置方法，性能较好。

.. code:: python

   import time
   import pandas as pd
   import numpy as np
   import xarray as xr


   def d1_to_d2_low(df_ori: pd.DataFrame, nan_val=np.nan):
       """将 flatten 后的二维数据转为三维网格数据, 慢速版本

       Args:
           df_ori(pd.DataFrame): 二维数据
           nan_val(any): 缺测值, 默认为 np.nan

       Returns:
           (xr.DataDrray): 转换后的数据
       """
       lat_ser = df_ori["lat"].drop_duplicates().sort_values()
       lat_ser.index = range(len(lat_ser))
       lon_ser = df_ori["lon"].drop_duplicates().sort_values()
       lon_ser.index = range(len(lon_ser))

       empty = pd.DataFrame(
           data=np.full((len(lat_ser), len(lon_ser)), fill_value=nan_val)
       )

       lat_ser_list = list(lat_ser.values)
       lon_ser_list = list(lon_ser.values)
       lat_list = df_ori["lat"].to_list()
       lon_list = df_ori["lon"].to_list()
       for idx, val in enumerate(df_ori["value"].to_list()):
           lat_idx = lat_ser_list.index(lat_list[idx])
           lon_idx = lon_ser_list.index(lon_list[idx])
           empty.iloc[lat_idx, lon_idx] = val


       dr = xr.DataArray(empty, dims=("lat", "lon"), coords={"lat": lat_ser, "lon": lon_ser})
       xr.Dataset({"data":dr}).to_netcdf("station_grid.nc")
       return dr


   def d1_to_d2_fast(df_ori: pd.DataFrame, is_save: bool=True):
       """将 flatten 后的二维数据转为三维网格数据, 快速版本
       
       Args:
           df_ori(pd.DataFrame): 二维数据
           is_save(bool): 是否导出为 NC

       Returns:
           (xr.DataDrray): 转换后的数据
       """
       lat_ser = df_ori["lat"].drop_duplicates().sort_values()
       lat_ser.index = range(len(lat_ser))
       lon_ser = df_ori["lon"].drop_duplicates().sort_values()
       lon_ser.index = range(len(lon_ser))

       LAT, LON = np.meshgrid(np.array(lat_ser), np.array(lon_ser))

       df_flatten = np.vstack((LAT.flatten(), LON.flatten())).T

       df_mod = pd.DataFrame(data=df_flatten, columns=["lat", "lon"])
       df_mod["value"] = np.nan

       df_merged = pd.merge(df_ori, df_mod, on=["lat", "lon"], how="outer").sort_values(["lat", "lon"])
       df_merged.index = range(len(df_merged))
       df_merged["value"] = df_merged["value_x"]

       df_merged = df_merged[["lat", "lon", "value"]]

       grid = np.array(df_merged["value"]).reshape((len(lat_ser), len(lon_ser)), order="C") # C: 最里面的轴开始读写，F: 从最外面的轴开始读写
       dr = xr.DataArray(grid, dims=("lat", "lon"), coords={"lat": lat_ser, "lon": lon_ser})
       if is_save:
           xr.Dataset({"data":dr}).to_netcdf("station_grid.nc")
       return dr

   df = pd.read_csv("test_station.csv", sep=",", encoding="utf-8", comment="#")\
       .drop_duplicates(subset=["latitude", "longitude"], keep="first")\
           .reset_index()
   df = df[["latitude", "longitude", "total_column_water_vapour"]]
   df.columns = ["lat", "lon", "value"]

   start1 = time.time()
   r1 = d1_to_d2_low(df)
   print(time.time() - start1) # 0.03896808624267578

   start2 = time.time()
   r2 = d1_to_d2_fast(df)
   print(time.time() - start2) # 0.10771322250366211

执行代码后生成的 *station_grid.nc*
就是二维的站点数据转为三维的网格数据。

**这一步骤不是必须的**\ ，只是为了能直观的用 Panoply
快速查看站点数据的分布情况。当然你也可以用
`Matplotlib <https://matplotlib.org/stable/gallery/misc/keyword_plotting.html#sphx-glr-gallery-misc-keyword-plotting-py>`__
绘制站点数据的散点图。

代码最后注释标出的快速版的时间比慢速版的还要慢，这是正常的，这是因为示例数据数据量较少。当数据量很大，数据精度很高时，耗时的区别就非常明显了，可以自行尝试。

   注：站点数据要保证同一经纬度是唯一的，这里的示例数据因为源数据有其他维度，所以同一经纬度的数据不唯一，我在读取的时候手动去重了。

这个数据用 Panoply 预览是这样：

.. figure:: /_images/20230529/04.png
   :alt: 站点数据转为三维网格数据预览

   站点数据转为三维网格数据预览

--------------

将网格数据插值到站点数据
^^^^^^^^^^^^^^^^^^^^^^^^

完成这个步骤的常规方法是逐行读取站点数据，然后将每个站点插值到 *test_nc*
上：

.. code:: python

   import xarray as xr
   import numpy as np
   import pandas as pd

   with xr.open_dataset("test_grid.nc") as ds_nc:
       ds_nc = ds_nc.rename({"latitude":"lat", "longitude":"lon"}) # 重命名维度名称
       dr_nc = ds_nc.isel(time=0)["t"] # 用索引的方式选取首个 time 维度, 选取变量 t

   # 遍历站点数据，逐个点插值
   data_interp = []
   for idx, row in df.iterrows():
       _lat, _lon, _val = row
       data_interp.append([_lat, _lon, dr_nc.interp(lat=_lat, lon=_lon)])

   df_nc_interp = pd.DataFrame(data_interp, columns=["lat", "lon", "value"])
   dr_nc_to_station = d1_to_d2_fast(df_nc_interp)

   xr.Dataset({"data":dr_nc_to_station}).to_netcdf("dr_nc_to_station.nc")

得出的 *df_nc_interp* 就是插值后的数据，\ *dr_nc_to_station.nc*
是用上面的方法将其转成了三维网格。用 Panoply 预览如下：

.. figure:: /_images/20230529/05.png
   :alt: 格点数据插值到站点，慢速

   格点数据插值到站点，慢速

可以想见，这种方式性能也比较一般，当站点数据很多是，逐一循环速度很慢。

我们可以用
`Scipy <https://matplotlib.org/stable/gallery/misc/keyword_plotting.html#sphx-glr-gallery-misc-keyword-plotting-py>`__
的插值方法一次性得到所有的插值结果：

.. code:: python

   import time
   import xarray as xr
   import numpy as np
   import pandas as pd
   import scipy.interpolate as interpolate


   def grid_to_station_low(station_df: pd.DataFrame, grid_dr: xr.DataArray):
       """三维格点转插值到二维站点, 慢速

       Args:
           station_df(pd.DataFrame): 站点数据
           grid_dr: 格点数据

       Returns:
           (pd.DataFrame): 插值后的数据

       """
       # 遍历站点数据，逐个点插值
       data_interp = []
       for idx, row in station_df.iterrows():
           _lat, _lon, _val = row
           data_interp.append([_lat, _lon, grid_dr.interp(lat=_lat, lon=_lon)])

       df_nc_interp = pd.DataFrame(data_interp, columns=["lat", "lon", "value"])
       return df_nc_interp


   def grid_to_station_fast(station_df: pd.DataFrame, grid_dr: xr.DataArray):
       """三维格点转插值到二维站点, 快速

       Args:
           station_df(pd.DataFrame): 站点数据
           grid_dr: 格点数据

       Returns:
           (pd.DataFrame): 插值后的数据

       """
       grid_dr_lat, grid_dr_lon = np.meshgrid(grid_dr.lat, grid_dr.lon)
       grid_dr_points = np.transpose(np.array([grid_dr_lat.flatten(), grid_dr_lon.flatten()]))
       grid_dr_values = np.array(grid_dr.values).transpose().reshape(-1, 1)
       xi = (station_df.lat, station_df.lon)
       nc_interp_values = interpolate.griddata(
           grid_dr_points, grid_dr_values, xi, fill_value=np.nan, method='linear').squeeze()
       nc_interp_values = pd.Series(nc_interp_values)
       df_nc_interp = pd.DataFrame({"lat":df.lat, "lon":df.lon, "value":nc_interp_values})
       return df_nc_interp


   df = pd.read_csv("test_station.csv", sep=",", encoding="utf-8", comment="#")\
       .drop_duplicates(subset=["latitude", "longitude"], keep="first")\
           .reset_index()
   df = df[["latitude", "longitude", "total_column_water_vapour"]]
   df.columns = ["lat", "lon", "value"]

   with xr.open_dataset("test_grid.nc") as ds_nc:
       ds_nc = ds_nc.rename({"latitude":"lat", "longitude":"lon"}) # 重命名维度名称
       dr_nc = ds_nc.isel(time=0)["t"] # 用索引的方式选取首个 time 维度, 选取变量 t


   start1 = time.time()
   interp_1 = grid_to_station_low(df, dr_nc)
   dr_nc_to_station_1 = d1_to_d2_fast(interp_1)
   xr.Dataset({"data":dr_nc_to_station_1}).to_netcdf("dr_nc_to_station_1.nc")
   print(time.time() - start1) # 2.5377440452575684

   start2 = time.time()
   interp_2 = grid_to_station_fast(df, dr_nc)
   dr_nc_to_station_2 = d1_to_d2_fast(interp_2)
   xr.Dataset({"data":dr_nc_to_station_2}).to_netcdf("dr_nc_to_station_2.nc")
   print(time.time() - start2) # 21.849611043930054

上面的 ``grid_to_station_fast``
函数就可以一次性得到所有插值后的值。和上面一样，因为示例数据量较少，快速的方法优势体现不明显，可以换用数据量大的实际数据自行尝试。

这两种方式得到的数据是一样的，画出的图预览效果也一样：

.. figure:: /_images/20230529/06.png
   :alt: 格点数据插值到站点，快速

   格点数据插值到站点，快速

--------------

将三维网格数据转为二维
^^^^^^^^^^^^^^^^^^^^^^

**这个步骤也不是必须的**\ ，仅用于需要的情况。

``Xarray``
有方便的方法可以将三维的网格数据直接转为类似站点数据格式的二维数据：

.. code:: python

   import pandas as pd
   import xarray as xr

   with xr.open_dataset("test_grid.nc") as ds_nc:
       ds_nc = ds_nc.rename({"latitude":"lat", "longitude":"lon"}) # 重命名维度名称
       dr_nc = ds_nc.isel(time=0)["t"] # 用索引的方式选取首个 time 维度, 选取变量 t

   dr_stack = dr.stack(z=("lat", "lon"))

   pd.DataFrame(data={
       "lat":dr_stack.lat,
       "lon":dr_stack.lon,
       "value": dr_stack.values
   }).to_csv("d2_to_d1.csv", index=None)

--------------

将站点数据插值到网格数据上（反距离权重插值）
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

还会有一种需求，是将站点数据插值到指定精度的网格上。 原本为 NAN
的数据要运用反距离权重插值预测出对应的值，而反距离权重插值简单讲就是要预测的点的值取决于距离它最近的点。
与它距离越近，对它的影响就越大。

反距离权重插值需要安装
`wradlib <https://docs.wradlib.org/en/latest/generated/wradlib.ipol.Idw.html#wradlib.ipol.Idw>`__
库，用 Conda 可以直接安装：

.. code:: shell

   conda install wradlib -c conda-forge -y

这里直接给出代码：

.. code:: python

   import numpy as np
   import pandas as pd
   import xarray as xr
   import wradlib.ipol as ipol


   # 目标网格精度
   nx, ny = 300, 300
   # 站点数据
   df = pd.read_csv("test_station.csv", sep=",", encoding="utf-8", comment="#")\
       .drop_duplicates(subset=["latitude", "longitude"], keep="first")\
           .reset_index()
   df = df[["latitude", "longitude", "total_column_water_vapour"]]
   df.columns = ["lat", "lon", "value"]
   data_lon, data_lat, data_val = df["lon"], df["lat"], df["value"]
   vals = data_val.values
   src = np.vstack((data_lon, data_lat)).transpose()
   # 生成目标经纬度坐标
   range_lon = [round(i,2) for i in np.linspace(data_lon.min()-20, data_lon.max()+20, nx)]
   range_lat = [round(i,2) for i in np.linspace(data_lat.min()-20, data_lat.max()+20, ny)]

   # 生成目标经纬度网格
   lon_lst, lat_lst = np.meshgrid(range_lon, range_lat)
   trg = np.vstack((lon_lst.ravel(), lat_lst.ravel())).T
   # IDW 插值
   idw = ipol.Idw(src, trg)
   interpolated = idw(vals)
   grid = interpolated.reshape((len(range_lon), len(range_lat)))
   nc_interp = xr.DataArray(grid, dims=("lat", "lon"), coords={"lat":range_lat, "lon":range_lon})
   xr.Dataset({"data": nc_interp}).to_netcdf("station_to_grid.nc")

插值后的 NC 数据预览如下，可以和上面的站点图像做对比：

.. figure:: /_images/20230529/07.png
   :alt: 格点数据插值到站点，快速

   格点数据插值到站点，快速

--------------

示例数据下载
~~~~~~~~~~~~

.. [1]
   `test_station.csv </data/20230529/test_station.csv>`__

.. [2]
   `test_grid.nc </data/20230529/test_grid.nc>`__

.. [3]
   `test_grid.grib2 </data/20230529/test_grid.grib2>`__
   
--------------

视频讲解
~~~~~~~~

`Bilibili`_

.. _Bilibili: https://www.bilibili.com/video/BV1iX4y147eT/

