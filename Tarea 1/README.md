# Tarea 1. Figuras con WebGL - Raziel Martínez

## Descripción
Utilizando WebGL dibuja lo siguiente: 
1. Una pirámide pentagonal en 3D.
2. Un dodecaedro.
3. Un octaedro.

## Líbrerías utilizadas
- gl-matrix
- jquery-3.4.1

## Desarrollo de figuras
Para colocar los vértices de cada figura fui dibujando en una hoja de papel cada punto. Para el octaedro y la pirámide pentagonal fue sencillo y lo pude realizar por mi cuenta. 
El dodecaedro me dió más problema ya que eran muchos vértices y tenían que ser calculados con una fórmula para que se viera lo más regular posible. Ésta fórmula puede ser encontrada en el siguiente link de Wikipedia: https://en.wikipedia.org/wiki/Regular_dodecahedron
Todos los vértices fueron calculados de manera manual. Para colocar las figuras como fueron solicitadas en el viewport fui acomodándolas en el script que se encuentra en el HTML pasándo los parámetros de x,y,z en la traslación a la función para crear cada fiura. Use el mismo procedimiento para la rotación específicada.
Finalmente, para mover el octaedro de arriba hacia abajo, agregué una variable global booleana que detecta si el octaedro debe ir hacia arriba o hacia abajo, la cual es modificada cada vez que alcanza un límite (de arriba o abajo) del viewport el cual fijé manualmente viendo hasta donde llegaba la ModelViewMatrix y dependiendo de esto es como traslado al octaedro,
de manera positiva o negativa dependiendo hacia donde tenga que ir.
