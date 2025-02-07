import { createContextBuilder } from '../../context';
import { addActionContext } from '../action-context';
import { addRelation, addStep, createProcessBuilder } from './process-builder';
import { getProcessFactory, Process } from '../process';
import { ProcessName } from '../../types';

describe('process-manager', () => {
  describe('process-builder', () => {
    type State = 'in-progress' | 'closed';
    type Command = 'to-work' | 'close';
    type Payload = number;
    const processName: ProcessName = {
      name: 'to-do-process',
      version: '1.0',
    };

    it('create empty process', () => {
      const context = createContextBuilder().pipe(addActionContext()).build();
      const process = createProcessBuilder(
        {
          name: 'to-do-process',
          version: '1.0',
        },
        context
      ).build<Process<State, Payload, Command>>(getProcessFactory());

      expect(process).toBeDefined();
      expect(process.processName).toEqual({ ...processName });
      expect(process.graph.edges.length).toEqual(0);
      expect(process.graph.nodes.length).toEqual(0);
    });

    it('add steps', () => {
      const context = createContextBuilder().pipe(addActionContext()).build();
      const process = createProcessBuilder<State, Payload, Command>(
        {
          name: 'to-do-process',
          version: '1.0',
        },
        context
      )
        .pipe(addStep('in-progress'), addStep('closed'))
        .build<Process<State, Payload, Command>>(getProcessFactory());

      const inProgressStep = process.graph.searchNodes(
        (n) => n.status === 'in-progress'
      )[0];
      const closedStep = process.graph.searchNodes(
        (n) => n.status === 'closed'
      )[0];

      expect(inProgressStep).toBeDefined();
      expect(inProgressStep.value.processName).toEqual(processName);
      expect(closedStep).toBeDefined();
      expect(closedStep.value.processName).toEqual(processName);
    });

    it('add relation', () => {
      const context = createContextBuilder().pipe(addActionContext()).build();
      const process = createProcessBuilder<State, Payload, Command>(
        {
          name: 'to-do-process',
          version: '1.0',
        },
        context
      )
        .pipe(addStep('in-progress'), addStep('closed'))
        .pipe(addRelation('in-progress', 'closed', 'close'))
        .build<Process<State, Payload, Command>>(getProcessFactory());

      const closeEdge = process.graph.searchEdges(
        (n) => n.command === 'close'
      )[0];

      expect(closeEdge).toBeDefined();
      expect(closeEdge.start).toEqual(0);
      expect(closeEdge.end).toEqual(1);
      expect(closeEdge.weight.command).toEqual('close');
    });
  });
});
