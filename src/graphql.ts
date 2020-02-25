import { schema, log } from 'nexus-future'

interface Foo {
  bar: {
    baz: string
  }
}

const foo: Foo = {
  bar: {
    baz: 'test',
  },
}

schema.addToContext(_req => {
  return {
    foo,
  }
})

schema.objectType({
  name: 'World',
  definition(t) {
    t.model.id()
    t.model.name()
    t.model.population()
  },
})

schema.queryType({
  definition(t) {
    t.field('hello', {
      type: 'World',
      args: {
        world: schema.stringArg({ required: false }),
      },
      async resolve(_root, args, ctx) {
        log.debug('foo', ctx.foo)

        const worldToFindByName = args.world ?? 'Earth'
        const world = await ctx.db.world.findOne({
          where: {
            name: worldToFindByName,
          },
        })

        if (!world) throw new Error(`No such world named "${args.world}"`)

        return world
      },
    })

    t.list.field('worlds', {
      type: 'World',
      resolve(_root, _args, ctx) {
        return ctx.db.world.findMany()
      },
    })
  },
})
