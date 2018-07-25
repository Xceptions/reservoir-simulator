$(document).ready(init);

function init(){
    var N = [],
        t = [],
        gridblock = [],
        T, /* transmissibility */
        qCoefficient,
        qsc = [],
        Tminus = [],
        Tplus = [],
        pressure_unit = [],
        timestep,
        gridcount,
        init_array = [],
        pressures = [];
    
    var n,
        tInterval,
        gbcount,
        count,
        Bc,
        x, y, z,
        area,
        vol,
        visc,
        Bl,
        a, c,
        k,
        q,
        newq,
        q_occurs,
        newq_occurs,
        por,
        init_press,
        boundary_condition;
    
    
    
    var retrieve_parameters = function() {
        /* ===============================================
         * this function gets the input data in
         * the required form e.g array or number or string
         * ===============================================
         */
        var get_param = function(param) {
            return parseFloat($(param).val());
        }
        n         = get_param('#n');
        tInterval = get_param('#tInterval');
        gbcount   = get_param('#gbcount');
        Bl        = get_param('#Bl');
        Blo       = get_param('#Blo');
        x         = get_param('#x');
        y         = get_param('#y');
        z         = get_param('#z');
        k         = get_param('#k');
        visc      = get_param('#visc');
        a         = get_param('#a');
        por       = get_param('#por');
        comp      = get_param('#comp');
        q         = $('#q').val();
        q_occurs  = $('#q_occurs').val(); //know where q occurs
        init_press= get_param('#init_press');
        boundary_condition = $('#boundary_condition').val();
        
        
        /* =========================================================================
         * shift for qsc, Tplus, Tminus and pressure_unit to make up for gridblock=0
         * =========================================================================
         */
        for(count=0; count<(n/tInterval); count++){
            N.push(count);
        }
        for(count=tInterval; count<=n; count+=tInterval){
            t.push(count);
        }
        t.unshift(0);
        for(count=1; count<=gbcount; count++){
            gridblock.push(count);
        }
        
        /* =================parameters===================== */
        area = y * z;
        vol  = x * y * z;
        T = (1.127*area*k)/(visc*Bl*x);
        qCoefficient = (a*Blo*tInterval)/(vol*por*comp);
        newq = q.split(',');
        newq_occurs = q_occurs.split(',');
        /* ================================================ */
        
        for(count=1; count<=gbcount; count++){
            qsc.push(0);
        }
        for(count=0;count<q.length; count++){
            qsc[newq_occurs[count]-1] = newq[count];
        }
        qsc.push(0);
        qsc.unshift(0);
        
        for(count=1; count<=gbcount; count++){
            Tplus.push(T);
        }
        Tplus[gbcount-1] = 0;
        Tplus.push(0);
        Tplus.unshift(0);
        
        for(count=1; count<=gbcount; count++){
            Tminus.push(T);
        }
        Tminus[0] = 0;
        Tminus.push(0);
        Tminus.unshift(0);
        
        for(count=1; count<=gbcount; count++){
            init_array.push(init_press);
        }
        init_array.push(0);
        init_array.unshift(0);
        pressures[0] = init_array;
        init_array = [];
    }
    
    
    
    var perform_iteration = function(boundary_condition) {
        switch (boundary_condition)
        {  /* first test for flow condition */
            case 'flow':
                for(timestep=0; timestep<N.length; timestep++){
                    for(gridcount=1; gridcount<=gridblock.length; gridcount++){
                       var newpressureunit;
                        newpressureunit = pressures[0][2] + qCoefficient*qsc[gridcount] + qCoefficient*(Tplus[gridcount]*pressures[timestep][gridcount+1] - (Tplus[gridcount]+Tminus[gridcount])*pressures[timestep][gridcount] + Tminus[gridcount]*pressures[timestep][gridcount-1]);
                        
                        pressure_unit.push(newpressureunit);
                    }
                    pressure_unit.unshift(0);
                    pressure_unit.push(0);
                    pressures[timestep+1] = pressure_unit;
                    pressure_unit = [];
                }
                break;
                
            case 'noflow':
                for(timestep=0; timestep<N.length; timestep++){
                    for(gridcount=1; gridcount<=gridblock.length; gridcount++){
                       var newpressureunit;
                        newpressureunit = pressures[timestep][gridcount] + qCoefficient*qsc[gridcount] + qCoefficient*(Tplus[gridcount]*pressures[timestep][gridcount+1] - (Tplus[gridcount]+Tminus[gridcount])*pressures[timestep][gridcount] + Tminus[gridcount]*pressures[timestep][gridcount-1]);
                        
                        pressure_unit.push(newpressureunit);
                    }
                    pressure_unit.unshift(0);
                    pressure_unit.push(0);
                    pressures[timestep+1] = pressure_unit;
                    pressure_unit = [];
                }
                break;

            case 'constantflow':
                for(timestep=0; timestep<N.length; timestep++){
                    for(gridcount=1; gridcount<=gridblock.length; gridcount++){
                       var newpressureunit;
                        newpressureunit = pressures[timestep][gridcount] + qCoefficient*qsc[gridcount] + qCoefficient*(Tplus[gridcount]*pressures[timestep][gridcount+1] - (Tplus[gridcount]+Tminus[gridcount])*pressures[timestep][gridcount] + Tminus[gridcount]*pressures[timestep][gridcount-1]);
                        
                        pressure_unit.push(newpressureunit);
                    }
                    pressure_unit.unshift(0);
                    pressure_unit.push(0);
                    pressures[timestep+1] = pressure_unit;
                    pressure_unit = [];
                }
                for(count=0; count<=N.length; count++){
                    pressures[count][1] = 6000; 
                }
                break;
        }
        //to remove the zero's
        for(count=0; count<=N.length; count++){
            pressures[count].shift();
            pressures[count].pop();
        }
        
        document.write('<p>transmissibility = ' + T + '</p>');
        document.write('<p>coefficient of flow = ' + qCoefficient + '</p>');
        document.write('<table>');
        document.write('<tr class="boldtext">');
            document.write('<td>');
            document.write('Time (days)');
            document.write('</td>')
            for(count=1; count<=gridblock.length; count++){
                document.write('<td>');
                document.write('BLOCK ' + count);
                document.write('</td>');
            }
        document.write('</tr>');
        for(count=0; count<=N.length; count++){
            document.write('    <tr>');
            document.write('        <td>');
            document.write(t[count]);
            document.write('        </td>');
            for(gridcount=0; gridcount<gridblock.length; gridcount++){
                document.write('    <td>');
                document.write(pressures[count][gridcount])
                document.write('    </td>');
            }
            document.write('    </tr>');
        }
        document.write('</table>');
    }
    
    
    
    var reinitialize_variables = function(){
        N = [];
        t = [];
        gridblock = [];
        qsc = [];
        Tplus = [];
        Tminus = [];
        init_arrray = [];
        pressure_unit = [];
        pressures = [];
    }
    
/*=========== THIS ABOVE IS WHERE THE SIMULATION FUNCTION ENDS ===========*/
    
    //prepare the calc button to perform the iterations
    $('#calc').on('click', function(){
        retrieve_parameters();
        perform_iteration(boundary_condition);
        reinitialize_variables();
    });
    
    
    var group_select_state = 'show';
    $('#view_group').on('click', function(){
        switch (group_select_state){
            case 'show':
                $('.group_details').show();
                $('.two').show();
                group_select_state = 'hide';
                $('#view_group').text('hide group details');
                break;
            case 'hide':
                $('.group_details').hide();
                $('.two').hide();
                group_select_state = 'show';
                $('#view_group').text('show group details');
                break;
        }
    });
}